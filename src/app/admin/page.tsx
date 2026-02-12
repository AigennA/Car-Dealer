"use client";

import { useState, useEffect, useCallback } from "react";
import { type Car } from "@/lib/cars";
import { getAllCars, addCar, updateCar, deleteCar } from "@/lib/clientStorage";
import Link from "next/link";

const ACCOUNTS_KEY = "car_dealer_accounts";
const DEFAULT_ACCOUNT = { username: "admin", password: "admin123" };

function getAccounts(): { username: string; password: string }[] {
  if (typeof window === "undefined") return [DEFAULT_ACCOUNT];
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    const saved: { username: string; password: string }[] = data ? JSON.parse(data) : [];
    // Always ensure default account is in the list
    if (!saved.some((a) => a.username === DEFAULT_ACCOUNT.username)) {
      saved.unshift(DEFAULT_ACCOUNT);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(saved));
    }
    return saved.length > 0 ? saved : [DEFAULT_ACCOUNT];
  } catch {
    return [DEFAULT_ACCOUNT];
  }
}

function saveAccount(username: string, password: string): boolean {
  const accounts = getAccounts();
  if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) return false;
  accounts.push({ username, password });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return true;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("admin_auth");
      const savedUser = sessionStorage.getItem("admin_user");
      if (saved === "true" && savedUser) {
        setAuthenticated(true);
        setUsername(savedUser);
      }
    }
  }, []);

  const loadCars = useCallback(() => {
    setCars(getAllCars());
  }, []);

  useEffect(() => {
    if (authenticated) loadCars();
  }, [authenticated, loadCars]);

  const handleDelete = (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna bil?")) return;
    const deleted = deleteCar(id);
    if (deleted) {
      loadCars();
    } else {
      alert("Denna bil kan inte tas bort (statisk data).");
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingCar(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCar(null);
    loadCars();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.trim();
    if (!user) {
      setAuthError("Ange ett användarnamn.");
      return;
    }
    const accounts = getAccounts();
    const account = accounts.find((a) => a.username.toLowerCase() === user.toLowerCase());
    if (account && account.password === passwordInput) {
      setAuthenticated(true);
      setUsername(user);
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_user", user);
      setAuthError("");
    } else {
      setAuthError("Fel användarnamn eller lösenord.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.trim();
    if (!user) {
      setAuthError("Ange ett användarnamn.");
      return;
    }
    if (passwordInput.length < 4) {
      setAuthError("Lösenordet måste vara minst 4 tecken.");
      return;
    }
    const success = saveAccount(user, passwordInput);
    if (success) {
      setRegisterSuccess("Konto skapat! Du kan nu logga in.");
      setIsRegistering(false);
      setAuthError("");
    } else {
      setAuthError("Användarnamnet finns redan.");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUsername("");
    setPasswordInput("");
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_user");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-navy mb-6 text-center">
            {isRegistering ? "Skapa konto" : "Admin Login"}
          </h1>

          {registerSuccess && !isRegistering && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-800 text-sm text-center">
              {registerSuccess}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Användarnamn
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setAuthError(""); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                placeholder="Ditt användarnamn"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Lösenord
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setAuthError(""); }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                placeholder="Ange lösenord"
              />
            </div>
            {authError && (
              <p className="text-red-600 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:brightness-90 transition font-medium cursor-pointer"
            >
              {isRegistering ? "Skapa konto" : "Logga in"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError("");
                setRegisterSuccess("");
              }}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              {isRegistering ? "Har du redan ett konto? Logga in" : "Skapa nytt konto"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Demo: användarnamn &quot;admin&quot;, lösenord &quot;admin123&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy">Admin Panel</h1>
              <p className="text-gray-600 mt-1">
                Inloggad som <span className="font-medium text-navy">{username}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                Tillbaka till sidan
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium cursor-pointer"
              >
                Logga ut
              </button>
              <button
                onClick={handleAdd}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:brightness-90 transition font-medium cursor-pointer"
              >
                + Lägg till bil
              </button>
            </div>
          </div>
        </div>

        {/* Cars List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Bil
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    År
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Miltal
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Pris
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Bränsle
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/bilar/${car.slug}`} className="flex items-center gap-3 group">
                        <img
                          src={car.images[0]}
                          alt={car.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {car.make} {car.model}
                          </div>
                          <div className="text-sm text-gray-500">{car.color}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {car.year}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {car.mileage.toLocaleString()} mil
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {car.price.toLocaleString()} kr
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {car.fuel}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleEdit(car)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all duration-200 font-medium mr-3"
                      >
                        Redigera
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:shadow-lg transition-all duration-200 font-medium"
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {cars.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">Inga bilar än. Lägg till din första bil!</p>
            <button
              onClick={handleAdd}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:brightness-90 transition font-medium cursor-pointer"
            >
              + Lägg till bil
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CarFormModal
          car={editingCar}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

function CarFormModal({ car, onClose }: { car: Car | null; onClose: () => void }) {
  const [formData, setFormData] = useState({
    make: car?.make || "",
    model: car?.model || "",
    year: car?.year?.toString() || "",
    mileage: car?.mileage?.toString() || "",
    fuel: car?.fuel || "Bensin",
    transmission: car?.transmission || "Automat",
    drivetrain: car?.drivetrain || "FWD",
    bodyType: car?.bodyType || "Sedan",
    color: car?.color || "",
    price: car?.price?.toString() || "",
    description: car?.description || "",
    features: car?.features?.join(", ") || "",
    images: car?.images?.join(", ") || "",
    featured: car?.featured || false,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const features = formData.features.split(",").map((f) => f.trim()).filter(Boolean);
      const images = formData.images.split(",").map((i) => i.trim()).filter(Boolean);
      const make = formData.make.trim();
      const model = formData.model.trim();
      const slug = `${make}-${model}-${formData.year}`
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const carData: Car = {
        id: car?.id || `custom-${Date.now()}`,
        slug: car?.slug || slug,
        make,
        model,
        title: `${make} ${model}`,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        fuel: formData.fuel,
        transmission: formData.transmission,
        drivetrain: formData.drivetrain,
        bodyType: formData.bodyType,
        color: formData.color.trim(),
        price: parseInt(formData.price),
        images: images.length > 0
          ? images
          : ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop"],
        featured: formData.featured,
        description: formData.description.trim(),
        features,
      };

      if (car) {
        updateCar(car.id, carData);
      } else {
        addCar(carData);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save car:", error);
      alert("Ett fel uppstod");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-navy">
            {car ? "Redigera bil" : "Lägg till ny bil"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                Märke *
              </label>
              <input
                id="make"
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                placeholder="Märke"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Modell *
              </label>
              <input
                id="model"
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="Modell"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Årsmodell *
              </label>
              <input
                id="year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max="2030"
                placeholder="År"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                Miltal *
              </label>
              <input
                id="mileage"
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
                min="0"
                placeholder="Miltal"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Pris (kr) *
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="Pris"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Färg *
              </label>
              <input
                id="color"
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="Färg"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">
                Bränsle *
              </label>
              <select
                id="fuel"
                name="fuel"
                value={formData.fuel}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              >
                <option value="Bensin">Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="El">El</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                Växellåda *
              </label>
              <select
                id="transmission"
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              >
                <option value="Automat">Automat</option>
                <option value="Manuell">Manuell</option>
              </select>
            </div>

            <div>
              <label htmlFor="drivetrain" className="block text-sm font-medium text-gray-700 mb-1">
                Drivning *
              </label>
              <select
                id="drivetrain"
                name="drivetrain"
                value={formData.drivetrain}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              >
                <option value="FWD">FWD (Framhjulsdrift)</option>
                <option value="RWD">RWD (Bakhjulsdrift)</option>
                <option value="AWD">AWD (Fyrhjulsdrift)</option>
              </select>
            </div>

            <div>
              <label htmlFor="bodyType" className="block text-sm font-medium text-gray-700 mb-1">
                Karosstyp *
              </label>
              <select
                id="bodyType"
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Kombi">Kombi</option>
                <option value="Halvkombi">Halvkombi</option>
                <option value="Coupé">Coupé</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivning *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Ange bilens beskrivning"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utrustning (kommaseparerad)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows={2}
              placeholder="LED-strålkastare, Navigation, Panoramatak"
              title="Ange bilens utrustning, kommaseparerad"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Bild-URL (kommaseparerad)
            </label>
            <input
              id="images"
              type="text"
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Utvald bil (visas på startsidan)
              </span>
            </label>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:brightness-90 transition font-medium disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Sparar..." : car ? "Uppdatera" : "Lägg till"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
