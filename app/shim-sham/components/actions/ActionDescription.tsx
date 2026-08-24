export function ActionDescription({ text }: { text: string }) {
  if (!text) {
    return null;
  }

  return <div className="action-summary">{text}</div>;
}
