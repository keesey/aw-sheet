export function ActionToggle({
  checked,
  disabled,
  onChange,
  label,
  variant,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  variant?: "force-field" | "jetpack";
}) {
  const variantClass =
    variant === "force-field"
      ? " action-toggle--force-field"
      : variant === "jetpack"
        ? " action-toggle--jetpack"
        : "";

  return (
    <label className={`action-toggle${variantClass}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
      <span className="action-toggle__track" aria-hidden />
    </label>
  );
}
