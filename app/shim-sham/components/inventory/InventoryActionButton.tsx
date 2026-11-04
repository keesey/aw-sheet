import type { ActionCostIconKind } from "@/lib/shim-sham/data/action-cost-icons";
import { ActionCostIcon } from "../icons/ActionCostIcon";

export function InventoryActionButton({
  kind,
  label,
  title,
  disabled,
  onClick,
}: {
  kind: ActionCostIconKind;
  label: string;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="btn inventory-action-btn"
      title={title}
      disabled={disabled}
      aria-label={title ?? label}
      onClick={onClick}
    >
      <ActionCostIcon kind={kind} className="inventory-action-btn__icon" />
      <span className="inventory-action-btn__label">{label}</span>
    </button>
  );
}
