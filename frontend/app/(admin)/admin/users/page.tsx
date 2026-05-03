"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { EditUserModal } from "@/features/admin/users/modals/EditUserModal";
import { ViewUserModal } from "@/features/admin/users/modals/ViewUserModal";
import { CreateUserModal } from "@/features/admin/users/modals/CreateUserModal";
import { Pagination } from "@/features/admin/users/Pagination";
import { User } from "@/shared/types";
import { UsersTable } from "@/features/admin/users/UsersTable";
import { Header } from "@/features/admin/users/Header";
import { Filters } from "@/features/admin/users/Filters";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";
import { useUsers } from "@/shared/hooks/useUsers";
import { ResultsInfo } from "@/features/admin/users/ResultsInfo";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { users, isLoading, error, totalCount, fetchUsers, deleteUser } = useUsers();

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, roleFilter);
  }, [currentPage, roleFilter]);

  const handleDelete = (id: string) => {
    deleteUser(id, () => fetchUsers(currentPage, searchTerm, roleFilter));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = [roleFilter !== "all"].filter(Boolean).length;

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <Header setShowModal={setShowModal} />

      {/* Filters Section */}
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={(e) => setSearchTerm(e.target.value)}
        setCurrentPage={setCurrentPage}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        roleFilter={roleFilter}
        setRoleFilter={(e) => setRoleFilter(e.target.value)}
        clearFilters={clearFilters}
      />

      {/* Results Info */}
      <ResultsInfo
        totalCount={totalCount}
        totalPages={totalPages}
        activeFiltersCount={activeFiltersCount}
        currentPage={currentPage}
      />

      {/* Error State */}
      {error && <ErrorState error={error} fetch={() => fetchUsers(currentPage, searchTerm, roleFilter)} />}

      {/* Loading State */}
      {isLoading ? <LoadingState title="Cargando usuarios..." /> : (
        /* Users Table */
        <UsersTable
          filteredUsers={filteredUsers}
          setSelectedUser={setSelectedUser}
          setShowEditModal={setShowEditModal}
          setShowViewModal={setShowViewModal}
          handleDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchUsers(currentPage, searchTerm, roleFilter);
          setShowModal(false);
        }}
      />

      {/* View User Modal */}
      <ViewUserModal
        user={selectedUser}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUsers(currentPage, searchTerm, roleFilter);
        }}
      />
    </div>
  );
}
