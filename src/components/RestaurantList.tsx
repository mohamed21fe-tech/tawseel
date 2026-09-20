import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Restaurant } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Star, Clock, Bike, Filter, Check, Flame } from 'lucide-react';

interface RestaurantListProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
  searchQuery: string;
  selectedCategory: string | null;
}

type SortOption = 'recommended' | 'rating' | 'fastest' | 'cheapest_delivery';

export const RestaurantList: React.FC<RestaurantListProps> = ({
  onSelectRestaurant,
  searchQuery,
  selectedCategory,
}) => {
  const { restaurants, lang, lowBandwidthMode } = useApp();
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (onlyOpen && !r.isOpen) return false;

      // Filter by category if selected
      if (selectedCategory) {
        const hasCat = r.categories.some((c) => c.id === selectedCategory);
        if (!hasCat) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q) || r.nameAr.includes(q);
        const matchCuisine = r.cuisine.toLowerCase().includes(q) || r.cuisineAr.includes(q);
        const matchNeighborhood = r.neighborhood.toLowerCase().includes(q) || r.addressAr.includes(q);
        const matchDishes = r.menuItems.some(
          (m) => m.name.toLowerCase().includes(q) || m.nameAr.includes(q)
        );

        return matchName || matchCuisine || matchNeighborhood || matchDishes;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fastest') {
        const aMin = parseInt(a.estimatedTime) || 30;
        const bMin = parseInt(b.estimatedTime) || 30;
        return aMin - bMin;
      }
      if (sortBy === 'cheapest_delivery') return a.deliveryFee - b.deliveryFee;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [restaurants, onlyOpen, selectedCategory, searchQuery, sortBy]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {lang === 'ar' ? 'مطاعم إدلب المتوفرة الآن' : 'Available Restaurants in Idlib'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {lang === 'ar'
              ? `${filteredRestaurants.length} مطعم جاهز لتلقي طلبك`
              : `${filteredRestaurants.length} restaurants ready to deliver`}
          </p>
        </div>

        {/* Filter Badges & Sort Menu */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Only Open Toggle */}
          <button
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
              onlyOpen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${onlyOpen ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            <span>{lang === 'ar' ? 'مفتوح الآن فقط' : 'Open Now Only'}</span>
          </button>

          {/* Sort pills */}
          <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setSortBy('recommended')}
              className={`rounded-lg px-2.5 py-1 transition ${
                sortBy === 'recommended' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              {lang === 'ar' ? 'المقترح' : 'Recommended'}
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`rounded-lg px-2.5 py-1 transition ${
                sortBy === 'rating' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              {lang === 'ar' ? 'الأعلى تقييماً' : 'Top Rated'}
            </button>
            <button
              onClick={() => setSortBy('fastest')}
              className={`rounded-lg px-2.5 py-1 transition ${
                sortBy === 'fastest' ? 'bg-white text-orange-600 shadow-xs' : 'text-stone-600'
              }`}
            >
              {lang === 'ar' ? 'الأسرع' : 'Fastest'}
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Cards Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="my-16 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {lang === 'ar' ? 'لم نعثر على مطاعم تطابق بحثك' : 'No restaurants matched your search'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {lang === 'ar'
              ? 'جرّب البحث باسم وجبة أو مطعم آخر أو إلغاء التصنيفات المحددة.'
              : 'Try searching for another dish or clear active filters.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => {
            return (
              <div
                key={restaurant.id}
                id={`restaurant-card-${restaurant.id}`}
                onClick={() => onSelectRestaurant(restaurant)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs hover:shadow-lg hover:border-orange-200 transition duration-200 flex flex-col"
              >
                {/* Banner Header with Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  {!lowBandwidthMode ? (
                    <img
                      src={restaurant.banner}
                      alt={restaurant.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-200 text-stone-500 text-sm font-semibold">
                      {lang === 'ar' ? restaurant.nameAr : restaurant.name}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 start-3 flex items-center gap-1.5">
                    {restaurant.featured && (
                      <span className="flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-md">
                        <Flame className="h-3 w-3" />
                        <span>{lang === 'ar' ? 'مميز' : 'Featured'}</span>
                      </span>
                    )}
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-bold shadow-md ${
                        restaurant.isOpen
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-200'
                      }`}
                    >
                      {restaurant.isOpen
                        ? lang === 'ar'
                          ? 'مفتوح'
                          : 'Open'
                        : lang === 'ar'
                        ? 'مغلق حالياً'
                        : 'Closed'}
                    </span>
                  </div>

                  {/* Estimated Time Badge */}
                  <div className="absolute bottom-3 end-3 flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-stone-800 shadow-md backdrop-blur-xs">
                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                    <span>{lang === 'ar' ? restaurant.estimatedTimeAr : restaurant.estimatedTime}</span>
                  </div>

                  {/* Logo overlay */}
                  <div className="absolute -bottom-4 start-4">
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md bg-white"
                    />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-stone-900 group-hover:text-orange-600 transition line-clamp-1">
                          {lang === 'ar' ? restaurant.nameAr : restaurant.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {lang === 'ar' ? restaurant.cuisineAr : restaurant.cuisine} • {restaurant.neighborhood}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-black text-amber-800 border border-amber-200 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{restaurant.rating}</span>
                        <span className="text-[10px] text-amber-700 font-normal">({restaurant.reviewCount})</span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {lang === 'ar' ? restaurant.descriptionAr : restaurant.description}
                    </p>
                  </div>

                  {/* Delivery & Min Order Footer */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-1">
                      <Bike className="h-3.5 w-3.5 text-orange-600" />
                      <span>{lang === 'ar' ? 'التوصيل:' : 'Delivery:'}</span>
                      <strong className="text-stone-800 font-bold">
                        {formatCurrency(restaurant.deliveryFee, lang)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-stone-400">{lang === 'ar' ? 'الحد الأدنى:' : 'Min:'} </span>
                      <span className="font-semibold text-stone-700">
                        {formatCurrency(restaurant.minOrder, lang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
