import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Heart,
  Check,
  Star,
  X,
  MapPin,
  Calendar,
} from "lucide-react";

// Type definitions
interface FoodItem {
  id: number;
  name: string;
  location: string;
  type: string;
  alcoholic?: boolean;
  description: string;
  dateFrom: string | null;
  dateTo: string | null;
  park: string;
  image?: string | null;
  isNew: boolean;
  isPlantBased: boolean;
  zone: string;
  isEvent?: boolean;
}

interface UserRatings {
  [itemId: number]: number;
}

// Import the JSON data
import foodDataJson from "../../data/foodData.json";
const foodData: FoodItem[] = foodDataJson;

const DisneyFoodApp: React.FC = () => {
  // Local storage helpers
  const getStoredData = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const setStoredData = <T,>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  };

  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPark, setSelectedPark] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [alcoholicFilter, setAlcoholicFilter] = useState<string>("all");
  const [plantBasedFilter, setPlantBasedFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() =>
    getStoredData("disney-food-favorites", [])
  );
  const [eaten, setEaten] = useState<number[]>(() =>
    getStoredData("disney-food-eaten", [])
  );
  const [ratings, setRatings] = useState<UserRatings>(() =>
    getStoredData("disney-food-ratings", {})
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showNewOnly, setShowNewOnly] = useState<boolean>(false);

  // Update localStorage when state changes
  useEffect(() => {
    setStoredData("disney-food-favorites", favorites);
  }, [favorites]);

  useEffect(() => {
    setStoredData("disney-food-eaten", eaten);
  }, [eaten]);

  useEffect(() => {
    setStoredData("disney-food-ratings", ratings);
  }, [ratings]);

  // Get unique values for filters
  const parks = useMemo(
    () => [...new Set(foodData.map((item) => item.park))],
    []
  );
  const types = useMemo(
    () => [...new Set(foodData.map((item) => item.type))],
    []
  );
  const zones = useMemo(
    () => [...new Set(foodData.map((item) => item.zone))],
    []
  );
  const locations = useMemo(
    () => [...new Set(foodData.map((item) => item.location))].sort(),
    []
  );

  // Filtered data
  const filteredData = useMemo(() => {
    return foodData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPark = selectedPark === "all" || item.park === selectedPark;
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesZone = selectedZone === "all" || item.zone === selectedZone;
      const matchesLocation =
        selectedLocation === "all" || item.location === selectedLocation;
      const matchesAlcoholic =
        alcoholicFilter === "all" ||
        (alcoholicFilter === "yes" && item.alcoholic) ||
        (alcoholicFilter === "no" && !item.alcoholic);
      const matchesPlantBased =
        plantBasedFilter === "all" ||
        (plantBasedFilter === "yes" && item.isPlantBased) ||
        (plantBasedFilter === "no" && !item.isPlantBased);
      const matchesFavorites =
        !showFavoritesOnly || favorites.includes(item.id);
      const matchesNew = !showNewOnly || item.isNew;

      return (
        matchesSearch &&
        matchesPark &&
        matchesType &&
        matchesZone &&
        matchesLocation &&
        matchesAlcoholic &&
        matchesPlantBased &&
        matchesFavorites &&
        matchesNew
      );
    });
  }, [
    searchTerm,
    selectedPark,
    selectedType,
    selectedZone,
    selectedLocation,
    alcoholicFilter,
    plantBasedFilter,
    showFavoritesOnly,
    showNewOnly,
    favorites,
  ]);

  // Helper functions
  const toggleFavorite = (itemId: number): void => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleEaten = (itemId: number): void => {
    setEaten((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const setItemRating = (itemId: number, rating: number): void => {
    setRatings((prev) => ({ ...prev, [itemId]: rating }));
  };

  // Components
  interface StarRatingProps {
    itemId: number;
    rating: number;
    onRate: (itemId: number, rating: number) => void;
    size?: string;
  }

  const StarRating: React.FC<StarRatingProps> = ({
    itemId,
    rating,
    onRate,
    size = "w-5 h-5",
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(itemId, star)}
            className={`${size} ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  interface ItemCardProps {
    item: FoodItem;
  }

  const ItemCard: React.FC<ItemCardProps> = ({ item }) => (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.opacity = "1";
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
              style={{ opacity: 0 }}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight text-gray-900 line-clamp-2">
              {item.name}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className={`p-1 ${
                  favorites.includes(item.id) ? "text-red-500" : "text-gray-400"
                } hover:text-red-500 transition-colors`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.includes(item.id) ? "fill-current" : ""
                  }`}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEaten(item.id);
                }}
                className={`p-1 ${
                  eaten.includes(item.id) ? "text-green-500" : "text-gray-400"
                } hover:text-green-500 transition-colors`}
              >
                <Check
                  className={`w-4 h-4 ${
                    eaten.includes(item.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.location}
          </p>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              {item.isNew && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  NEW
                </span>
              )}
              {item.isPlantBased && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Plant-based
                </span>
              )}
              {item.alcoholic && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Alcoholic
                </span>
              )}
            </div>

            {ratings[item.id] && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">
                  {ratings[item.id]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  interface ModalProps {
    item: FoodItem;
    onClose: () => void;
  }

  const Modal: React.FC<ModalProps> = ({ item, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 pr-4">{item.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {item.image && (
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "1";
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.display =
                    "none";
                }}
                style={{ opacity: 0 }}
              />
            </div>
          )}

          <div className="space-y-4">
            {item.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Location:</span>
                <p className="text-gray-600">{item.location}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Park:</span>
                <p className="text-gray-600">{item.park}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Zone:</span>
                <p className="text-gray-600">{item.zone}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Type:</span>
                <p className="text-gray-600">{item.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                Available: {item.dateFrom} - {item.dateTo}
              </span>
            </div>

            <div className="flex gap-2">
              {item.isNew && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  NEW
                </span>
              )}
              {item.isPlantBased && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Plant-based
                </span>
              )}
              {item.alcoholic && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  Alcoholic
                </span>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">
                  Rate this item:
                </span>
                <StarRating
                  itemId={item.id}
                  rating={ratings[item.id] || 0}
                  onRate={setItemRating}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    favorites.includes(item.id)
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(item.id) ? "fill-current" : ""
                    }`}
                  />
                  {favorites.includes(item.id)
                    ? "Favorited"
                    : "Add to Favorites"}
                </button>

                <button
                  onClick={() => toggleEaten(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    eaten.includes(item.id)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <Check
                    className={`w-4 h-4 ${
                      eaten.includes(item.id) ? "fill-current" : ""
                    }`}
                  />
                  {eaten.includes(item.id) ? "Eaten" : "Mark as Eaten"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-40">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 text-center">
            Disney Food Guide
          </h1>

          {/* Search Bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-700 gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Favorites Only
            </button>

            <button
              onClick={() => setShowNewOnly(!showNewOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showNewOnly
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              New Only
            </button>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="space-y-3 mt-3">
              {/* First row - Parks, Types, Zones */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={selectedPark}
                  onChange={(e) => setSelectedPark(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Parks</option>
                  {parks.map((park) => (
                    <option key={park} value={park}>
                      {park}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Food</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Zones</option>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Second row - Location */}
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Third row - Alcoholic and Plant-based */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={alcoholicFilter}
                  onChange={(e) => setAlcoholicFilter(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alcoholic?</option>
                  <option value="yes">Alcoholic Only</option>
                  <option value="no">Non-Alcoholic Only</option>
                </select>

                <select
                  value={plantBasedFilter}
                  onChange={(e) => setPlantBasedFilter(e.target.value)}
                  className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Plant Based?</option>
                  <option value="yes">Plant-based Only</option>
                  <option value="no">Non Plant-based Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Counter */}
      <div className="px-4 py-2 bg-gray-100">
        <p className="text-sm text-gray-600">
          {filteredData.length} item{filteredData.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Food List */}
      <div className="px-4 py-4 space-y-3">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No items found matching your criteria.</p>
          </div>
        ) : (
          filteredData.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default DisneyFoodApp;
