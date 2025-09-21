// src/pages/permissions/PermissionDesigner.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const columnStyle = {
  background: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  minHeight: 240,
};

const PermissionDesigner = () => {
  const [groups, setGroups] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [gRes, uRes] = await Promise.all([
        api.get("permission-groups/"),
        api.get("permission-groups/unassigned/"),
      ]);
      setGroups(gRes.data);
      setUnassigned(uRes.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load groups/permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Column reorder (Unassigned + Groups)
    if (type === "COLUMN") {
      if (source.index === destination.index) return;
      const reordered = Array.from(columns);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      // Separate unassigned & groups
      const newGroups = reordered
        .filter((c) => c.key.startsWith("group-"))
        .map((c) => groups.find((g) => `group-${g.id}` === c.key));
      setGroups(newGroups);

      // Save order (skip unassigned)
      try {
        await api.post("permission-groups/reorder/", {
          order: newGroups.map((g) => g.id),
        });
      } catch {
        toast.error("Failed to reorder groups");
      }
      return;
    }

    // Permission drag
    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;

    const getColumnItems = (colId) => {
      if (colId === "unassigned") return unassigned;
      const g = groups.find((x) => `group-${x.id}` === colId);
      return g ? g.permissions : [];
    };

    const setColumnItems = (colId, items) => {
      if (colId === "unassigned") {
        setUnassigned(items);
      } else {
        setGroups((prev) =>
          prev.map((g) =>
            `group-${g.id}` === colId ? { ...g, permissions: items } : g
          )
        );
      }
    };

    const srcItems = Array.from(getColumnItems(srcCol));
    const dstItems = Array.from(getColumnItems(dstCol));

    const [moved] = srcItems.splice(source.index, 1);

    // prevent duplicate
    const filteredDst = dstItems.filter((x) => x.id !== moved.id);
    filteredDst.splice(destination.index, 0, moved);

    setColumnItems(srcCol, srcItems);
    setColumnItems(dstCol, filteredDst);

    try {
      if (srcCol === dstCol && srcCol.startsWith("group-")) {
        const groupId = parseInt(srcCol.split("-")[1], 10);
        await api.post(`permission-groups/${groupId}/reorder-items/`, {
          ids: filteredDst.map((p) => p.id),
        });
        return;
      }

      const toGroupId =
        dstCol === "unassigned" ? null : parseInt(dstCol.split("-")[1], 10);

      await api.post("permission-groups/move/", {
        permission_id: moved.id,
        to_group_id: toGroupId,
        new_index: destination.index,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to move. Reloading…");
      loadAll();
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await api.post("permission-groups/", {
        name: newGroupName.trim(),
      });
      setGroups((prev) => [...prev, res.data]);
      setNewGroupName("");
      toast.success("Group created");
    } catch {
      toast.error("Failed to create group");
    }
  };

  const renameGroup = async (id, name) => {
    const { value: newName } = await Swal.fire({
      title: "Rename Group",
      input: "text",
      inputLabel: "Enter new group name",
      inputValue: name,
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: (val) => {
        if (!val.trim()) {
          Swal.showValidationMessage("Name cannot be empty!");
        }
        return val.trim();
      },
    });

    if (!newName) return;

    try {
      const res = await api.patch(`permission-groups/${id}/`, { name: newName });
      setGroups((prev) => prev.map((g) => (g.id === id ? res.data : g)));
      toast.success("Renamed");
    } catch {
      toast.error("Failed to rename");
    }
  };

  const deleteGroup = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This group will be deleted and its permissions will move to Unassigned.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`permission-groups/${id}/`);
      await loadAll();
      toast.success("Group deleted");
    } catch {
      toast.error("Failed to delete group");
    }
  };

  const columns = useMemo(() => {
    return [
      { key: "unassigned", title: "Unassigned", items: unassigned },
      ...groups.map((g) => ({
        key: `group-${g.id}`,
        title: g.name,
        groupId: g.id,
        items: g.permissions,
      })),
    ];
  }, [groups, unassigned]);

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <h3 className="m-0">Module Designer </h3>
        <form className="d-flex gap-2" onSubmit={createGroup}>
          <input
            type="text"
            className="form-control"
            placeholder="New Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <button className="btn btn-primary" type="submit">
            Add Group
          </button>
          <button
            className="btn btn-success btn-outline-secondary" style={{color:"#fff"}}
            type="button"
            onClick={loadAll}
          >
            Refresh
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading…</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div
                className="row"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {columns.map((col, colIdx) => (
                  <div key={col.key} className="col-md-6 mb-3">
                    <Draggable draggableId={col.key} index={colIdx}>
                      {(cp) => (
                        <div ref={cp.innerRef} {...cp.draggableProps}>
                          <div className="card shadow-sm h-100">
                            <div
                              className={`card-header ${
                                col.key === "unassigned"
                                  ? "bg-secondary"
                                  : "bg-primary"
                              } text-white fw-bold d-flex justify-content-between`}
                            >
                              <span {...cp.dragHandleProps}>{col.title}</span>
                              {col.key !== "unassigned" && (
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-light"
                                    onClick={() =>
                                      renameGroup(col.groupId, col.title)
                                    }
                                  >
                                    Rename
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => deleteGroup(col.groupId)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="card-body" style={columnStyle}>
                              <Droppable droppableId={col.key} type="ITEM">
                                {(p) => (
                                  <div ref={p.innerRef} {...p.droppableProps}>
                                    {col.items.map((item, idx) => (
                                      <Draggable
                                        key={`perm-${item.id}-c${col.key}`}
                                        draggableId={`perm-${item.id}`}
                                        index={idx}
                                      >
                                        {(pp) => (
                                          <div
                                            ref={pp.innerRef}
                                            {...pp.draggableProps}
                                            {...pp.dragHandleProps}
                                            className="border rounded p-2 mb-2 bg-white"
                                          >
                                            <div className="fw-semibold small">
                                              {item.name}
                                            </div>
                                            <div className="text-muted small">
                                              {item.code}
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {p.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="text-muted small mt-3">
        Tip: Drag groups (including Unassigned) to reorder. Permissions save
        instantly when moved.
      </div>

      <ToastContainer position="top-right" autoClose={1800} />
    </div>
  );
};

export default PermissionDesigner;
