"use client";

import { useState, useMemo } from "react";
import { User } from "@/types";

interface UserMultiSelectProps {
  users: User[];
  defaultSelected: string[];
  name: string;
  label: string;
  placeholder?: string;
}

export default function UserMultiSelect({
  users,
  defaultSelected,
  name,
  label,
  placeholder = "Buscar usuarios...",
}: UserMultiSelectProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(defaultSelected));
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lowerTerm = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lowerTerm) ||
        u.username?.toLowerCase().includes(lowerTerm) ||
        u.email?.toLowerCase().includes(lowerTerm)
    );
  }, [users, searchTerm]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} <span className="text-xs font-normal text-zinc-500">({selectedIds.size} seleccionados)</span>
      </label>
      
      {/* Hidden inputs to submit data */}
      {Array.from(selectedIds).map((id) => (
        <input key={`hidden-${id}`} type="hidden" name={name} value={id} />
      ))}

      <div className="border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none"
          />
        </div>
        
        <div className="max-h-64 overflow-y-auto p-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-500">
              No se encontraron usuarios.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedIds.has(user.id);
              return (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(user.id)}
                    className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-blue-600"
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {user.avatar ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`}
                        alt={user.name || "Avatar"}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex-shrink-0 uppercase">
                        {user.name?.[0] || user.email[0]}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user.name || user.username}
                        {user.role === "admin" && (
                          <span className="ml-1 text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
