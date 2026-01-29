import time
from typing import Any, Dict, List, Tuple

from firebase_admin import firestore as admin_firestore


def _replace_server_timestamps(value: Any) -> Any:
    if value is admin_firestore.SERVER_TIMESTAMP:
        return time.time()
    if isinstance(value, dict):
        return {key: _replace_server_timestamps(val) for key, val in value.items()}
    if isinstance(value, list):
        return [_replace_server_timestamps(item) for item in value]
    return value


def _get_collection_dict(
    store: Dict[str, Dict[str, Any]],
    path_parts: List[str],
    create: bool = True,
) -> Dict[str, Any] | None:
    if len(path_parts) % 2 == 0:
        raise ValueError("Collection path must end with a collection name.")

    collections = store
    index = 0
    while index < len(path_parts):
        collection_name = path_parts[index]
        if create:
            collection = collections.setdefault(collection_name, {})
        else:
            collection = collections.get(collection_name)
            if collection is None:
                return None

        if index == len(path_parts) - 1:
            return collection

        doc_id = path_parts[index + 1]
        if create:
            doc = collection.setdefault(
                doc_id, {"__data__": {}, "__subcollections__": {}}
            )
        else:
            doc = collection.get(doc_id)
            if doc is None:
                return None

        collections = doc["__subcollections__"]
        index += 2

    return None


class MockDocumentSnapshot:
    def __init__(self, data: Dict[str, Any] | None):
        self._data = data or {}

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data)


class MockQuery:
    def __init__(
        self,
        store: Dict[str, Dict[str, Any]],
        path_parts: List[str],
        order_by_field: str | None = None,
        direction: str | Any = "ASCENDING",
        limit_count: int | None = None,
    ):
        self._store = store
        self._path_parts = list(path_parts)
        self._order_by_field = order_by_field
        self._direction = direction
        self._limit_count = limit_count

    def order_by(self, field: str, direction: str | Any = "ASCENDING") -> "MockQuery":
        return MockQuery(
            self._store,
            self._path_parts,
            order_by_field=field,
            direction=direction,
            limit_count=self._limit_count,
        )

    def limit(self, count: int) -> "MockQuery":
        return MockQuery(
            self._store,
            self._path_parts,
            order_by_field=self._order_by_field,
            direction=self._direction,
            limit_count=count,
        )

    def get(self) -> List[MockDocumentSnapshot]:
        collection = _get_collection_dict(self._store, self._path_parts, create=False)
        if not collection:
            return []

        docs: List[Tuple[str, Dict[str, Any]]] = list(collection.items())

        if self._order_by_field:
            def sort_key(item: Tuple[str, Dict[str, Any]]) -> Tuple[bool, Any]:
                data = item[1].get("__data__", {})
                value = data.get(self._order_by_field)
                return (value is None, value)

            direction = (
                "DESCENDING"
                if self._direction == admin_firestore.Query.DESCENDING
                or str(self._direction).upper() == "DESCENDING"
                else "ASCENDING"
            )

            with_value = [item for item in docs if item[1]["__data__"].get(self._order_by_field) is not None]
            without_value = [item for item in docs if item[1]["__data__"].get(self._order_by_field) is None]
            with_value = sorted(with_value, key=sort_key, reverse=direction == "DESCENDING")
            docs = with_value + without_value

        if self._limit_count is not None:
            docs = docs[: self._limit_count]

        return [MockDocumentSnapshot(doc["__data__"]) for _, doc in docs]


class MockCollectionRef:
    def __init__(self, store: Dict[str, Dict[str, Any]], path_parts: List[str]):
        self._store = store
        self._path_parts = list(path_parts)

    def document(self, doc_id: str) -> "MockDocumentRef":
        return MockDocumentRef(self._store, self._path_parts + [doc_id])

    def order_by(self, field: str, direction: str | Any = "ASCENDING") -> MockQuery:
        return MockQuery(self._store, self._path_parts, order_by_field=field, direction=direction)

    def limit(self, count: int) -> MockQuery:
        return MockQuery(self._store, self._path_parts, limit_count=count)

    def get(self) -> List[MockDocumentSnapshot]:
        return MockQuery(self._store, self._path_parts).get()


class MockDocumentRef:
    def __init__(self, store: Dict[str, Dict[str, Any]], path_parts: List[str]):
        self._store = store
        self._path_parts = list(path_parts)

    def collection(self, name: str) -> MockCollectionRef:
        return MockCollectionRef(self._store, self._path_parts + [name])

    def set(self, data: Dict[str, Any], merge: bool | None = False) -> None:
        parent_path = self._path_parts[:-1]
        doc_id = self._path_parts[-1]
        collection = _get_collection_dict(self._store, parent_path, create=True)
        if collection is None:
            return

        doc = collection.setdefault(doc_id, {"__data__": {}, "__subcollections__": {}})
        incoming = _replace_server_timestamps(data)
        if merge:
            doc["__data__"].update(incoming)
        else:
            doc["__data__"] = dict(incoming)


class MockFirestoreClient:
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def collection(self, name: str) -> MockCollectionRef:
        return MockCollectionRef(self._store, [name])
