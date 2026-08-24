import type { CharacterSheet } from "@/lib/types";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";

export function SheetHeader({
  data,
  runtime,
  save,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  save: SaveFn;
}) {
  return (
    <header className="sheet-header">
      <div className="sheet-header-row">
        <div>
          <h1 className="sheet-title">{data.name}</h1>
          <p className="sheet-subtitle">
            “{data.nickname}” ·{" "}
            <AonLink href={data.ancestry.url}>{data.ancestry.name}</AonLink>
            {" · "}
            <AonLink href={data.background.url}>{data.background.name}</AonLink>
            {" · Level "}
            {runtime.level}{" "}
            <AonLink href={data.class.url}>{data.class.name.replace(/\d+/, "").trim()}</AonLink>
            {" · "}
            <AonLink href={data.style.url}>{data.style.name}</AonLink>
          </p>
        </div>
        <div className="sheet-header-actions">
          <button
            type="button"
            className={`btn ${runtime.accelerate ? "accelerate-on" : ""}`}
            onClick={() => void save({ accelerate: !runtime.accelerate })}
            aria-pressed={runtime.accelerate}
          >
            Accelerate
          </button>
          <button
            type="button"
            className={`btn ${runtime.jetpack ? "jetpack-on" : ""}`}
            onClick={() => void save({ jetpack: !runtime.jetpack })}
            aria-pressed={runtime.jetpack}
          >
            Jetpack
          </button>
          <button
            type="button"
            className={`btn ${runtime.panache ? "panache-on" : ""}`}
            onClick={() => void save({ panache: !runtime.panache })}
            aria-pressed={runtime.panache}
            disabled={!runtime.combat}
          >
            Panache
          </button>
          <button
            type="button"
            className={`btn ${runtime.combat ? "combat-on" : ""}`}
            onClick={() => {
              const nextCombat = !runtime.combat;
              void save(nextCombat ? { combat: true } : { combat: false, panache: false });
            }}
            aria-pressed={runtime.combat}
          >
            Combat
          </button>
        </div>
      </div>
    </header>
  );
}
