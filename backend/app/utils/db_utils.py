from typing import TypeVar, Type, Any
from sqlalchemy import select
from sqlalchemy.sql.expression import Select

ModelType = TypeVar("ModelType")

def paginate(query: Select, skip: int, limit: int) -> Select:
    return query.offset(skip).limit(limit)

def sort_query(query: Select, model: Type[ModelType], sort_by: str, sort_order: str = "asc") -> Select:
    column = getattr(model, sort_by, None)
    if column is not None:
        if sort_order.lower() == "desc":
            return query.order_by(column.desc())
        return query.order_by(column.asc())
    return query
