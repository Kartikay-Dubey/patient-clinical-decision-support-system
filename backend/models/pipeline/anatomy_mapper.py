"""
Condition-to-Anatomy Mapping Service
Provides deterministic anatomical localization, target organs, and BodyParts3D / Human Atlas
FMA structure linkages for all 49 DDXPlus clinical conditions.
"""

import json
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
DEFAULT_BODY_MAPPING_PATH = PROJECT_ROOT / "backend" / "data" / "ddxplus" / "body_mapping.json"
DEFAULT_CONDITIONS_PATH = PROJECT_ROOT / "backend" / "data" / "ddxplus" / "raw" / "release_conditions.json"

VALID_PRIMARY_REGIONS = {
    "Head",
    "Thorax",
    "Abdomen",
    "Pelvis",
    "Upper Limb",
    "Lower Limb"
}


@dataclass
class AtlasStructure:
    name: str
    conceptId: str  # FMA ID, e.g. "FMA7088"
    partId: Optional[str] = None  # BodyParts3D part ID, e.g. "FJ2564"


@dataclass
class AnatomyMapping:
    condition_name: str
    icd10_id: str
    primaryRegion: str
    secondaryRegions: List[str]
    bodySystem: str
    targetOrgan: str
    spatialCoordinates: Dict[str, float]
    atlas_structures: List[AtlasStructure]
    status: str = "mapped"  # "mapped" or "unmapped"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "condition_name": self.condition_name,
            "icd10_id": self.icd10_id,
            "primaryRegion": self.primaryRegion,
            "secondaryRegions": self.secondaryRegions,
            "bodySystem": self.bodySystem,
            "targetOrgan": self.targetOrgan,
            "spatialCoordinates": self.spatialCoordinates,
            "atlas_structures": [asdict(s) for s in self.atlas_structures],
            "status": self.status
        }


class ConditionAnatomyMapper:
    """
    Curated, deterministic anatomical localization service for DDXPlus conditions.
    Maps conditions to primary/secondary 3D regions, physiological body systems,
    target organs, spatial coordinates, and BodyParts3D FMA identifiers.
    """

    def __init__(
        self,
        mapping_path: Optional[Union[str, Path]] = None,
        conditions_path: Optional[Union[str, Path]] = None
    ):
        self.mapping_path = Path(mapping_path) if mapping_path else DEFAULT_BODY_MAPPING_PATH
        self.conditions_path = Path(conditions_path) if conditions_path else DEFAULT_CONDITIONS_PATH

        self._mappings: Dict[str, AnatomyMapping] = {}
        self._load_mappings()

    def _load_mappings(self):
        """Loads and parses body_mapping.json into strongly-typed AnatomyMapping objects."""
        if not self.mapping_path.exists():
            raise FileNotFoundError(f"Body mapping file not found at: {self.mapping_path}")

        with open(self.mapping_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_mappings = data.get("mappings", {})
        for cond_name, info in raw_mappings.items():
            structures = [
                AtlasStructure(
                    name=s.get("name", ""),
                    conceptId=s.get("conceptId", ""),
                    partId=s.get("partId")
                )
                for s in info.get("atlas_structures", [])
            ]

            self._mappings[cond_name] = AnatomyMapping(
                condition_name=cond_name,
                icd10_id=info.get("icd10-id", "Unknown"),
                primaryRegion=info.get("primaryRegion", "Thorax"),
                secondaryRegions=info.get("secondaryRegions", []),
                bodySystem=info.get("bodySystem", "General"),
                targetOrgan=info.get("targetOrgan", "General Anatomy"),
                spatialCoordinates=info.get("spatialCoordinates", {"x": 0.0, "y": 1.2, "z": 0.3}),
                atlas_structures=structures,
                status=info.get("status", "mapped")
            )

    def get_mapping(self, condition_name: str) -> AnatomyMapping:
        """
        Retrieves the anatomical mapping for a given condition.
        If condition is unknown, returns an explicit 'unmapped' status with default fallback values.
        """
        if condition_name in self._mappings:
            return self._mappings[condition_name]

        # Case-insensitive / normalized lookup fallback
        norm = condition_name.lower().strip()
        for k, v in self._mappings.items():
            if k.lower().strip() == norm:
                return v

        # Explicit unmapped fallback
        return AnatomyMapping(
            condition_name=condition_name,
            icd10_id="Unknown",
            primaryRegion="Thorax",
            secondaryRegions=[],
            bodySystem="General",
            targetOrgan="Unmapped Target Organ",
            spatialCoordinates={"x": 0.0, "y": 1.2, "z": 0.3},
            atlas_structures=[],
            status="unmapped"
        )

    def validate_all(
        self,
        conditions_path: Optional[Union[str, Path]] = None
    ) -> Dict[str, Any]:
        """
        Validates that every single DDXPlus condition from release_conditions.json has
        a curated, complete, and valid anatomy mapping.
        """
        target_path = Path(conditions_path) if conditions_path else self.conditions_path
        if not target_path.exists():
            raise FileNotFoundError(f"release_conditions.json not found at: {target_path}")

        with open(target_path, "r", encoding="utf-8") as f:
            conditions_meta = json.load(f)

        total_conditions = len(conditions_meta)
        mapped_count = 0
        unmapped_conditions = []
        validation_errors = []

        for cond_name, meta in conditions_meta.items():
            if cond_name not in self._mappings:
                unmapped_conditions.append(cond_name)
                continue

            mapping = self._mappings[cond_name]
            if mapping.status != "mapped":
                unmapped_conditions.append(cond_name)
                continue

            # Validate primaryRegion
            if mapping.primaryRegion not in VALID_PRIMARY_REGIONS:
                validation_errors.append(
                    f"{cond_name}: Invalid primaryRegion '{mapping.primaryRegion}'. Must be one of {VALID_PRIMARY_REGIONS}"
                )

            # Validate bodySystem
            if not mapping.bodySystem or len(mapping.bodySystem.strip()) < 2:
                validation_errors.append(f"{cond_name}: Empty or invalid bodySystem")

            # Validate targetOrgan
            if not mapping.targetOrgan or len(mapping.targetOrgan.strip()) < 2:
                validation_errors.append(f"{cond_name}: Empty or invalid targetOrgan")

            # Validate spatialCoordinates
            coords = mapping.spatialCoordinates
            if not isinstance(coords, dict) or not all(k in coords for k in ("x", "y", "z")):
                validation_errors.append(f"{cond_name}: Missing x, y, z in spatialCoordinates")

            # Validate atlas_structures
            if not mapping.atlas_structures:
                validation_errors.append(f"{cond_name}: atlas_structures list is empty")
            else:
                for s in mapping.atlas_structures:
                    if not s.name or not s.conceptId:
                        validation_errors.append(f"{cond_name}: AtlasStructure missing name or conceptId")

            mapped_count += 1

        is_valid = (mapped_count == total_conditions) and (len(validation_errors) == 0)

        return {
            "is_valid": is_valid,
            "total_conditions": total_conditions,
            "mapped_count": mapped_count,
            "unmapped_count": len(unmapped_conditions),
            "unmapped_conditions": unmapped_conditions,
            "validation_errors": validation_errors
        }

    def generate_markdown_report(self) -> str:
        """
        Generates a comprehensive clinical markdown table report of all 49 conditions,
        their ICD-10 code, primary/secondary regions, system, target organ, and BodyParts3D FMA structures.
        """
        val = self.validate_all()

        lines = [
            "# DDXPlus Condition-to-Anatomy Mapping Report",
            "",
            f"**Validation Status**: {'✅ All 49 Conditions Validated' if val['is_valid'] else '❌ Validation Errors Detected'}",
            f"- **Total Conditions**: {val['total_conditions']}",
            f"- **Successfully Mapped**: {val['mapped_count']}",
            f"- **Unmapped**: {val['unmapped_count']}",
            "",
            "## Anatomy & BodyParts3D Mapping Table",
            "",
            "| # | Condition Name | ICD-10 | Primary Region | Secondary Regions | Body System | Target Organ | BodyParts3D / FMA ID |",
            "| :-: | :--- | :---: | :---: | :--- | :--- | :--- | :--- |"
        ]

        # Order by condition name
        for idx, (cond_name, m) in enumerate(sorted(self._mappings.items()), 1):
            sec = ", ".join(m.secondaryRegions) if m.secondaryRegions else "—"
            fma_tokens = ", ".join([f"{s.name} (`{s.conceptId}`)" for s in m.atlas_structures]) if m.atlas_structures else "—"
            lines.append(
                f"| {idx} | **{cond_name}** | `{m.icd10_id}` | `{m.primaryRegion}` | {sec} | {m.bodySystem} | {m.targetOrgan} | {fma_tokens} |"
            )

        lines.append("")
        lines.append("---")
        lines.append("*Generated by ConditionAnatomyMapper — Deterministic Clinical Decision Support System*")
        return "\n".join(lines)
