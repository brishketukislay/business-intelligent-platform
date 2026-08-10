export type FormulaVariables =
  Record<string, number>;


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
export function getFormulaIdentifiers(
  formula: string
): string[] {

  const tokens =
    tokenize(formula);

  return Array.from(
    new Set(
      tokens
        .filter(
          (token) =>
            token.type === "identifier"
        )
        .map(
          (token) =>
            token.value
        )
    )
  );

}


class Parser {

  private position = 0;


  constructor(
    private readonly tokens: Token[],
    private readonly variables: FormulaVariables
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

}


export function evaluateFormula(
  formula: string,
  variables: FormulaVariables
): number {

  const tokens =
    tokenize(formula);


  const parser =
    new Parser(
      tokens,
      variables
    );


  return parser.parse();

}
