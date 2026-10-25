"""Safe mathematical calculator using AST traversal (no arbitrary eval)."""

import ast
import math
import operator
from typing import Any, Callable, Type
from crewai.tools import BaseTool
from pydantic import BaseModel
from app.modules.tools.schemas import CalculatorInput

_SAFE_OPERATORS: dict[Type[ast.AST], Callable[..., Any]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

_SAFE_FUNCTIONS: dict[str, Callable[..., Any]] = {
    "abs": abs,
    "round": round,
    "sqrt": math.sqrt,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "log": math.log,
    "log10": math.log10,
    "ceil": math.ceil,
    "floor": math.floor,
}

_SAFE_CONSTANTS: dict[str, float] = {
    "pi": math.pi,
    "e": math.e,
}


def safe_eval_math(expression: str) -> float | int:
    """Evaluate a mathematical expression safely using AST parsing."""
    cleaned = expression.strip().replace("^", "**")

    try:
        node = ast.parse(cleaned, mode="eval")
    except SyntaxError as e:
        raise ValueError(f"Invalid mathematical syntax: {e}")

    def _eval(current_node: ast.AST) -> float | int:
        if isinstance(current_node, ast.Expression):
            return _eval(current_node.body)

        elif isinstance(current_node, ast.Constant):
            if isinstance(current_node.value, (int, float)):
                return current_node.value
            raise ValueError(f"Unsupported constant type: {type(current_node.value).__name__}")

        elif isinstance(current_node, ast.Name):
            if current_node.id in _SAFE_CONSTANTS:
                return _SAFE_CONSTANTS[current_node.id]
            raise ValueError(f"Unknown constant or variable: '{current_node.id}'")

        elif isinstance(current_node, ast.BinOp):
            op_type = type(current_node.op)
            if op_type not in _SAFE_OPERATORS:
                raise ValueError(f"Unsupported binary operator: {op_type.__name__}")
            left = _eval(current_node.left)
            right = _eval(current_node.right)
            if op_type == ast.Pow and (right > 1000 or left > 1000):
                raise ValueError("Exponent or base too large for safe execution.")
            return _SAFE_OPERATORS[op_type](left, right)

        elif isinstance(current_node, ast.UnaryOp):
            op_type = type(current_node.op)
            if op_type not in _SAFE_OPERATORS:
                raise ValueError(f"Unsupported unary operator: {op_type.__name__}")
            operand = _eval(current_node.operand)
            return _SAFE_OPERATORS[op_type](operand)

        elif isinstance(current_node, ast.Call):
            if not isinstance(current_node.func, ast.Name):
                raise ValueError("Nested function attribute calls are prohibited.")
            func_name = current_node.func.id
            if func_name not in _SAFE_FUNCTIONS:
                raise ValueError(f"Function '{func_name}' is not in the safe mathematical whitelist.")
            args = [_eval(arg) for arg in current_node.args]
            return _SAFE_FUNCTIONS[func_name](*args)

        else:
            raise ValueError(f"Disallowed expression node: {type(current_node).__name__}")

    return _eval(node)


class SafeCalculatorTool(BaseTool):
    """Tool for safely evaluating mathematical expressions without arbitrary code execution."""

    name: str = "calculator"
    description: str = (
        "Calculates mathematical expressions with high precision. "
        "Supports arithmetic (+, -, *, /, //, %, **), constants (pi, e), and functions (sqrt, log, sin, cos, tan, abs, round)."
    )
    args_schema: Type[BaseModel] = CalculatorInput

    def _run(self, expression: str, **kwargs: object) -> str:
        """Execute calculation safely."""
        try:
            result = safe_eval_math(expression)
            # Format clean output (integer if exact whole number)
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            return f"Result: {result}"
        except ZeroDivisionError:
            return "Error: Division by zero."
        except Exception as e:
            return f"Calculation Error: {str(e)}"
