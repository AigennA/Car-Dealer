"use client";

import { useState } from "react";
import Link from "next/link";
import type { Car } from "@/lib/cars";
import { addCar, deleteCar, updateCar, useCars } from "@/lib/clientStorage";
import { signOut, useStaffUser } from "@/lib/admin/session";
import { ROUTES } from "@/config/navigation";
import LoginPanel from "@/components/admin/LoginPanel";
import CarTable from "@/components/admin/CarTable";
import CarFormDialog from "@/components/admin/CarFormDialog";

const ADMIN_MESSAGES = {
  deleted: (title: string) => `${title} togs bort.`,
  builtIn: (title: string) => `${title} ingår i grunddatan och kan inte tas bort här.`,
  builtInEdit: (title: string) => `${title} ingår i grunddatan och kan inte ändras här. Lägg till den som en ny bil i stället.`,
  saved: (title: string, isNew: boolean) => `${title} ${isNew ? "lades till" : "uppdaterades"}.`,
  confirmDelete: (title: string) => `Är du säker på att du vill ta bort ${title}?`,
} as const;

type Editing = { car: Car | null } | null;

/**
 * Demo staff page for the static website (data in this browser only).
 * Composition only: session, accounts, form model and UI live in their own modules.
 */
export default function AdminPage() {
  const user = useStaffUser();
  const cars = useCars();
  const [editing, setEditing] = useState<Editing>(null);
  const [notice, setNotice] = useState("");

  if (!user) return <LoginPanel />;

  const handleDelete = (car: Car) => {
    if (!confirm(ADMIN_MESSAGES.confirmDelete(car.title))) return;
    setNotice(deleteCar(car.id) ? ADMIN_MESSAGES.deleted(car.title) : ADMIN_MESSAGES.builtIn(car.title));
  };

  const handleSave = (car: Car, isNew: boolean) => {
    setEditing(null);
    if (isNew) addCar(car);
    else if (!updateCar(car.id, car)) return setNotice(ADMIN_MESSAGES.builtInEdit(car.title));
    setNotice(ADMIN_MESSAGES.saved(car.title, isNew));
  };

  const addButton = (
    <button type="button" onClick={() => setEditing({ car: null })}
      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium">
      + Lägg till bil
    </button>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy">Admin Panel</h1>
            <p className="text-gray-700 mt-1">Inloggad som <span className="font-medium text-navy">{user}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.home} className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors text-gray-800">
              Tillbaka till sidan
            </Link>
            <button type="button" onClick={signOut} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium">
              Logga ut
            </button>
            {addButton}
          </div>
        </div>

        <p role="status" aria-live="polite"
          className={notice ? "mb-4 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800" : "sr-only"}>
          {notice}
        </p>

        {cars.length > 0 ? (
          <CarTable cars={cars} onEdit={(car) => setEditing({ car })} onDelete={handleDelete} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-700 mb-4">Inga bilar än. Lägg till din första bil!</p>
            {addButton}
          </div>
        )}
      </div>

      {editing && <CarFormDialog car={editing.car} onSave={handleSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
