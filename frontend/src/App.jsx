// App.jsx
import React, { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

function App() {
  const [expression, setExpression] = useState("");
  const [evaluationType, setEvaluationType] = useState("basic");
  const [tac, setTac] = useState([]);
  const [quads, setQuads] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const generateTAC = () => {
    const expr = expression.replace(/\s+/g, "");
    setShowIntro(false);

    try {
      if (evaluationType === "quadratic") {
        const regex =
          /^([a-zA-Z0-9]+)x\^2([+\-])([a-zA-Z0-9]+)x([+\-])([a-zA-Z0-9]+)$/;
        const match = expr.match(regex);

        if (!match) throw new Error();

        const [_, a, sign1, b, sign2, c] = match;
        const tempSteps = [
          `t1 = ${a} * x`,
          `t2 = t1 * x`,
          `t3 = ${b} * x`,
          `t4 = t2 ${sign1} t3`,
          `t5 = t4 ${sign2} ${c}`,
          `result = t5`,
        ];

        setTac(tempSteps);
        convertToQuads(tempSteps);
        setFinalResult("Result depends on value of x.");
      } else {
        const tokens = expr.match(/[a-zA-Z0-9]+|[+\-*/()]/g);
        if (!tokens) throw new Error();

        const outputQueue = [];
        const operatorStack = [];
        const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
        const associativity = { "+": "L", "-": "L", "*": "L", "/": "L" };

        tokens.forEach((token) => {
          if (/^[a-zA-Z0-9]+$/.test(token)) {
            outputQueue.push(token);
          } else if ("+-*/".includes(token)) {
            while (
              operatorStack.length &&
              "*/+-".includes(operatorStack[operatorStack.length - 1]) &&
              ((associativity[token] === "L" &&
                precedence[token] <=
                  precedence[operatorStack[operatorStack.length - 1]]) ||
                (associativity[token] === "R" &&
                  precedence[token] <
                    precedence[operatorStack[operatorStack.length - 1]]))
            ) {
              outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
          } else if (token === "(") {
            operatorStack.push(token);
          } else if (token === ")") {
            while (
              operatorStack.length &&
              operatorStack[operatorStack.length - 1] !== "("
            ) {
              outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop();
          }
        });
        while (operatorStack.length) {
          outputQueue.push(operatorStack.pop());
        }

        const tacCode = [];
        const stack = [];
        let tempCount = 1;

        outputQueue.forEach((token) => {
          if ("+-*/".includes(token)) {
            const b = stack.pop();
            const a = stack.pop();
            const temp = `t${tempCount++}`;
            tacCode.push(`${temp} = ${a} ${token} ${b}`);
            stack.push(temp);
          } else {
            stack.push(token);
          }
        });

        tacCode.push(`result = ${stack.pop()}`);
        setTac(tacCode);
        setFinalResult("Evaluation depends on variable values.");
        convertToQuads(tacCode);
      }
    } catch (err) {
      alert("Invalid expression format");
    }
  };

  const convertToQuads = (tacList) => {
    const quadsList = tacList.map((line) => {
      const [left, expr] = line.split("=");
      const trimmed = expr.trim();
      let op = "=",
        arg1 = trimmed,
        arg2 = "";

      ["+", "-", "*", "/"].forEach((operator) => {
        if (trimmed.includes(operator)) {
          const parts = trimmed.split(operator);
          if (parts.length === 2) {
            [arg1, arg2] = parts;
            op = operator;
          }
        }
      });

      return [op, arg1.trim(), arg2.trim(), left.trim()];
    });
    setQuads(quadsList);
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Three Address Code Generator</Title>
        {showIntro && (
          <Subtitle>
            This web tool takes arithmetic expressions and generates
            corresponding
            <strong> Three Address Code (TAC)</strong> and{" "}
            <strong>Quadruple Representations</strong>. Designed for Compiler
            Construction projects.
            <br></br>
            <br></br> <strong>Submitted by: Rittwika Samanta</strong>
          </Subtitle>
        )}

        <Select
          value={evaluationType}
          onChange={(e) => setEvaluationType(e.target.value)}
        >
          <option value="basic">Basic</option>
          <option value="quadratic">Quadratic (ax² + bx + c)</option>
        </Select>

        <Input
          placeholder="Enter expression e.g. a + b * c or ax^2+bx+c"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
        />
        <Button onClick={generateTAC}>Generate Three Address Code</Button>

        {tac.length > 0 && (
          <>
            <h2>Three Address Code (TAC)</h2>
            <Table>
              <thead>
                <tr>
                  <Th>Step</Th>
                  <Th>Expression</Th>
                </tr>
              </thead>
              <tbody>
                {tac.map((line, index) => (
                  <tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{line}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <h2>Quadruple Representation</h2>
            <Table>
              <thead>
                <tr>
                  <Th>Op</Th>
                  <Th>Arg1</Th>
                  <Th>Arg2</Th>
                  <Th>Result</Th>
                </tr>
              </thead>
              <tbody>
                {quads.map((quad, index) => (
                  <tr key={index}>
                    {quad.map((item, i) => (
                      <Td key={i}>{item}</Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>

            <Result>Final Result: {finalResult}</Result>
          </>
        )}
      </Container>
    </>
  );
}

export default App;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #0d1117;
    color: #c9d1d9;
    font-family: 'Segoe UI', sans-serif;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #161b22;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #58a6ff;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
  color: #8b949e;
`;

const Input = styled.input`
  width: 96%;
  padding: 0.75rem;
  font-size: 1.1rem;
  border-radius: 10px;
  border: 1px solid #30363d;
  background-color: #0d1117;
  color: #c9d1d9;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #238636;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 1.5rem;

  &:hover {
    background-color: #2ea043;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
  border-radius: 10px;
  border: 1px solid #30363d;
  background-color: #0d1117;
  color: #c9d1d9;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  border: 1px solid #30363d;
  background: #21262d;
  padding: 0.6rem;
`;

const Td = styled.td`
  border: 1px solid #30363d;
  padding: 0.6rem;
  text-align: center;
`;

const Result = styled.p`
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
`;
