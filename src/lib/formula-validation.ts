import {
  evaluateFormula,
  getFormulaIdentifiers,
} from "@/features/metrics/services/formula-engine";

const FUNCTION_NAMES = new Set([
  "CUMULATIVE",
]);

export type FormulaValidationResult = {
  valid: boolean;
  error: string | null;
  references: string[];
};

function getFunctionArguments(
  formula: string
): Array<{
  name: string;
  args: string[];
}> {
  const results: Array<{
    name: string;
    args: string[];
  }> = [];

  const functionPattern =
    /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^()]*)\)/g;

  let match: RegExpExecArray | null;

  while ((match = functionPattern.exec(formula)) !== null) {
    const name = match[1];
    const rawArgs = match[2].trim();

    const args =
      rawArgs === ""
        ? []
        : rawArgs
            .split(",")
            .map((arg) => arg.trim());

    results.push({
      name,
      args,
    });
  }

  return results;
}

export function validateFormula(
  formula: string,
  availableKeys: Iterable<string>,
  currentMetricKey?: string
): FormulaValidationResult {
  const trimmed = formula.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: "Formula is required.",
      references: [],
    };
  }

  try {
    const references =
      getFormulaIdentifiers(trimmed);

    const available = new Set(
      Array.from(availableKeys).map((key) =>
        key.trim()
      )
    );

    if (
      currentMetricKey &&
      !available.has(currentMetricKey)
    ) {
      available.add(currentMetricKey);
    }

    for (const reference of references) {
      if (!available.has(reference)) {
        return {
          valid: false,
          error: `Unknown reference "${reference}".`,
          references,
        };
      }
    }

    const functions =
      getFunctionArguments(trimmed);

    for (const fn of functions) {
      if (!FUNCTION_NAMES.has(fn.name)) {
        return {
          valid: false,
          error: `Unknown formula function "${fn.name}".`,
          references,
        };
      }

      if (fn.name === "CUMULATIVE") {
        if (fn.args.length !== 1) {
          return {
            valid: false,
            error:
              "CUMULATIVE() requires exactly one key.",
            references,
          };
        }

        const key = fn.args[0];

        if (!/^[a-z0-9_]+$/.test(key)) {
          return {
            valid: false,
            error:
              "CUMULATIVE() requires a valid key.",
            references,
          };
        }

        if (!available.has(key)) {
          return {
            valid: false,
            error: `Unknown reference "${key}".`,
            references,
          };
        }
      }
    }

    const variables: Record<string, number> = {};

    for (const reference of references) {
      variables[reference] = 1;
    }

    evaluateFormula(
      trimmed,
      variables,
      {
        CUMULATIVE: () => 1,
      }
    );

    return {
      valid: true,
      error: null,
      references,
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Invalid formula.",
      references: [],
    };
  }
}