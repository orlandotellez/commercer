import { useState } from "react";
import { User } from "../types";
import { API_URL } from "../lib/constants";

const ITEMS_PER_PAGE = 10;

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async (page: number, searchTerm: string, roleFilter: string) => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) { setError("No hay sesión iniciada"); return; }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      });

      const res = await fetch(`${API_URL}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setUsers(data);
      setTotalCount(data.length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string, onSuccess: () => void) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al eliminar usuario");
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return { users, isLoading, error, totalCount, fetchUsers, deleteUser };
}
