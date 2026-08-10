export type FormulaVariables =
  Record<string, number>;


export type FormulaFunction =
  (...args: string[]) => number;


export type FormulaFunctions =
  Record<string, FormulaFunction>;


type Token =
  | {
      type: "number";
      value: number;
    }
  | {
      type: "identifier";
      value: string;
    }
  | {
      type: "operator";
      value: "+" | "-" | "*" | "/";
    }
  | {
      type: "leftParen";
    }
  | {
      type: "rightParen";
    }
  | {
      type: "comma";
    };


function tokenize(
  formula: string
): Token[] {

  const tokens: Token[] = [];

  let index = 0;


  while (index < formula.length) {

    const character =
      formula[index];


    if (/\s/.test(character)) {

      index++;

      continue;

    }


    if (/[0-9.]/.test(character)) {

      let value = "";

      let decimalCount = 0;


      while (
        index < formula.length &&
        /[0-9.]/.test(formula[index])
      ) {

        if (formula[index] === ".") {

          decimalCount++;

          if (decimalCount > 1) {

            throw new Error(
              "Invalid number in formula."
            );

          }

        }

        value += formula[index];

        index++;

      }


      const number =
        Number(value);


      if (!Number.isFinite(number)) {

        throw new Error(
          "Invalid number in formula."
        );

      }


      tokens.push({

        type: "number",

        value: number,

      });

      continue;

    }


    if (/[a-zA-Z_]/.test(character)) {

      let identifier = "";


      while (
        index < formula.length &&
        /[a-zA-Z0-9_]/.test(formula[index])
      ) {

        identifier +=
          formula[index];

        index++;

      }


      tokens.push({

        type: "identifier",

        value: identifier,

      });

      continue;

    }


    if (
      character === "+" ||
      character === "-" ||
      character === "*" ||
      character === "/"
    ) {

      tokens.push({

        type: "operator",

        value: character,

      });

      index++;

      continue;

    }


    if (character === "(") {

      tokens.push({
        type: "leftParen",
      });

      index++;

      continue;

    }


    if (character === ")") {

      tokens.push({
        type: "rightParen",
      });

      index++;

      continue;

    }


    if (character === ",") {

      tokens.push({
        type: "comma",
      });

      index++;

      continue;

    }


    throw new Error(
      `Unsupported character "${character}" in formula.`
    );

  }


  if (tokens.length === 0) {

    throw new Error(
      "Formula cannot be empty."
    );

  }


  return tokens;

}


/*
 * Return only identifiers that need to be resolved
 * as normal formula variables.
 *
 * Function arguments are intentionally excluded.
 *
 * Example:
 *
 * CUMULATIVE(actual_burnt_hours)
 *
 * returns:
 *
 * []
 *
 * Whereas:
 *
 * annual_target / 12
 *
 * returns:
 *
 * ["annual_target"]
 *
 * This is important because CUMULATIVE() receives
 * the input/metric key as a string and resolves it
 * itself.
 */
export function getFormulaIdentifiers(
  formula: string
): string[] {

  const tokens =
    tokenize(formula);


  const identifiers: string[] = [];


  for (
    let index = 0;
    index < tokens.length;
    index++
  ) {

    const token =
      tokens[index];


    if (
      token.type !== "identifier"
    ) {
      continue;
    }


    const nextToken =
      tokens[index + 1];


    /*
     * Function name.
     *
     * Example:
     *
     * CUMULATIVE(...)
     *
     * The function itself is not a variable.
     */
    if (
      nextToken?.type === "leftParen"
    ) {
      continue;
    }
    /*
     * If this identifier is inside a function
     * argument list, do not treat it as a normal
     * formula variable.
     *
     * Example:
     *
     * CUMULATIVE(actual_burnt_hours)
     *
     * actual_burnt_hours is resolved by the
     * CUMULATIVE function, not calculateMetric().
     */
    let depth = 0;


    for (
      let previousIndex = index - 1;
      previousIndex >= 0;
      previousIndex--
    ) {

      const previousToken =
        tokens[previousIndex];


      if (
        previousToken.type === "rightParen"
      ) {

        depth++;

        continue;

      }


      if (
        previousToken.type === "leftParen"
      ) {

        if (depth > 0) {

          depth--;

          continue;

        }


        const functionNameToken =
          tokens[previousIndex - 1];


        if (
          functionNameToken?.type === "identifier"
        ) {

          /*
           * This identifier is an argument to a
           * function call.
           */
          depth = -1;

        }

        break;

      }

    }


    if (depth === -1) {

      continue;

    }


    identifiers.push(
      token.value
    );

  }


  return Array.from(
    new Set(
      identifiers
    )
  );

}


class Parser {

  private position = 0;


  constructor(
    private readonly tokens: Token[],
    private readonly variables: FormulaVariables,
    private readonly functions: FormulaFunctions
  ) {}


  parse(): number {

    const result =
      this.parseExpression();


    if (
      this.position <
      this.tokens.length
    ) {

      throw new Error(
        "Unexpected token in formula."
      );

    }


    if (!Number.isFinite(result)) {

      throw new Error(
        "Formula produced an invalid result."
      );

    }


    return result;

  }


  private current(): Token | undefined {

    return this.tokens[
      this.position
    ];

  }


  private parseExpression(): number {

    let result =
      this.parseTerm();


    while (true) {

      const token =
        this.current();


      if (
        !token ||
        token.type !== "operator" ||
        (
          token.value !== "+" &&
          token.value !== "-"
        )
      ) {

        break;

      }


      this.position++;


      const right =
        this.parseTerm();


      if (token.value === "+") {

        result += right;

      } else {

        result -= right;

      }

    }


    return result;

  }


  private parseTerm(): number {

    let result =
      this.parseFactor();


    while (true) {

      const token =
        this.current();


      if (
        !token ||
        token.type !== "operator" ||
        (
          token.value !== "*" &&
          token.value !== "/"
        )
      ) {

        break;

      }


      this.position++;


      const right =
        this.parseFactor();


      if (token.value === "*") {

        result *= right;

      } else {

        if (right === 0) {

          throw new Error(
            "Division by zero."
          );

        }

        result /= right;

      }

    }


    return result;

  }


  private parseFactor(): number {

    const token =
      this.current();


    if (!token) {

      throw new Error(
        "Unexpected end of formula."
      );

    }


    if (
      token.type === "operator" &&
      token.value === "-"
    ) {

      this.position++;

      return -
        this.parseFactor();

    }


    if (
      token.type === "number"
    ) {

      this.position++;

      return token.value;

    }


    if (
      token.type === "identifier"
    ) {

      this.position++;


      const nextToken =
        this.current();


      /*
       * Function call:
       *
       * CUMULATIVE(actual_burnt_hours)
       */
      if (
        nextToken?.type === "leftParen"
      ) {

        return this.parseFunction(
          token.value
        );

      }


      const value =
        this.variables[token.value];


      if (
        value === undefined
      ) {

        throw new Error(
          `Unknown variable "${token.value}".`
        );

      }


      if (!Number.isFinite(value)) {

        throw new Error(
          `Variable "${token.value}" is not a valid number.`
        );

      }


      return value;

    }


    if (
      token.type === "leftParen"
    ) {

      this.position++;


      const result =
        this.parseExpression();


      const closing =
        this.current();


      if (
        !closing ||
        closing.type !== "rightParen"
      ) {

        throw new Error(
          "Missing closing parenthesis."
        );

      }


      this.position++;


      return result;

    }


    throw new Error(
      "Unexpected token in formula."
    );

  }


  private parseFunction(
    functionName: string
  ): number {

    const functionDefinition =
      this.functions[
        functionName
      ];


    if (!functionDefinition) {

      throw new Error(
        `Unknown formula function "${functionName}".`
      );

    }


    const opening =
      this.current();


    if (
      !opening ||
      opening.type !== "leftParen"
    ) {

      throw new Error(
        "Invalid function call."
      );

    }


    this.position++;


    const argumentsList: string[] = [];


    while (true) {

      const token =
        this.current();


      if (!token) {

        throw new Error(
          "Missing closing parenthesis in function."
        );

      }


      if (
        token.type === "rightParen"
      ) {

        this.position++;

        break;

      }


      if (
        token.type !== "identifier"
      ) {

        throw new Error(
          "Formula functions currently require identifier arguments."
        );

      }


      argumentsList.push(
        token.value
      );

      this.position++;


      const separator =
        this.current();


      if (
        separator?.type === "comma"
      ) {

        this.position++;

        continue;

      }


      if (
        separator?.type === "rightParen"
      ) {

        this.position++;

        break;

      }


      throw new Error(
        "Expected comma or closing parenthesis in function."
      );

    }


    const result =
      functionDefinition(
        ...argumentsList
      );


    if (!Number.isFinite(result)) {

      throw new Error(
        `Formula function "${functionName}" produced an invalid result.`
      );

    }


    return result;

  }

}


export function evaluateFormula(
  formula: string,
  variables: FormulaVariables,
  functions: FormulaFunctions = {}
): number {

  const tokens =
    tokenize(formula);


  const parser =
    new Parser(
      tokens,
      variables,
      functions
    );


  return parser.parse();

}