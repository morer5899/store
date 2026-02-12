import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import RatingModal from "./RatingModal";

export default function StoreCard({ store, onRatingSubmit }) {
  const { axiosInstance, user, isStoreOwner } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [averageRating, setAverageRating] = useState(
    parseFloat(store.averageRating) || 0
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRating();
    fetchAverageRating();
  }, [store.id]);

  const fetchUserRating = async () => {
    try {
      const response = await axiosInstance.get(`/rating/${store.id}/user`);
      const ratingData = response.data.data;

      if (ratingData?.rating !== undefined) {
        if (typeof ratingData.rating === "number") {
          setUserRating(ratingData.rating);
        } else if (
          typeof ratingData.rating === "object" &&
          ratingData.rating?.stars !== undefined
        ) {
          setUserRating(ratingData.rating.stars);
        }
      }
    } catch {
      try {
        const ratingsResponse = await axiosInstance.get(
          `/rating/${store.id}`
        );
        const ratings = ratingsResponse.data.data || [];
        const current = ratings.find((r) => r.userId === user?.id);
        if (current) setUserRating(current.stars);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await axiosInstance.get(
        `/rating/${store.id}/avg`
      );
      const avgData = response.data.data;

      if (typeof avgData === "string" || typeof avgData === "number") {
        setAverageRating(parseFloat(avgData) || 0);
      } else if (avgData?.averageRating !== undefined) {
        setAverageRating(parseFloat(avgData.averageRating) || 0);
      } else {
        setAverageRating(0);
      }
    } catch {
      setAverageRating(0);
    }
  };

  const handleRatingSubmit = async (stars) => {
    try {
      await axiosInstance.post(`/rating/${store.id}`, { stars });
      setUserRating(stars);
      fetchAverageRating();
      setShowRatingModal(false);
      if (onRatingSubmit) onRatingSubmit();
    } catch {}
  };

  const renderStars = (rating, max = 5) => {
    const numericRating = Math.round(parseFloat(rating) || 0);
    return Array.from({ length: max }).map((_, index) => (
      <StarIcon
        key={index}
        className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
          index < numericRating ? "text-amber-400" : "text-gray-200"
        }`}
      />
    ));
  };

  const ratingCount = store.ratings?.length || 0;
  const ratingText = ratingCount === 1 ? 'rating' : 'ratings';

  return (
    <>
      <div className="group relative bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md sm:hover:shadow-lg transition-all duration-300 ease-in-out">
        <div className="p-4 sm:p-5 md:p-6">
          {/* Header - Responsive */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-300">
                <BuildingStorefrontIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate leading-5 sm:leading-6">
                {store.storeName}
              </h3>
              <p className="text-xs sm:text-xs md:text-sm text-gray-500 truncate mt-0.5 sm:mt-1 leading-4 sm:leading-5 font-medium">
                {store.address}
              </p>
            </div>
          </div>

          {/* Rating section - Responsive with fixed rating display */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-4 pb-3 sm:pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(averageRating)}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 ml-0.5 sm:ml-1">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                {averageRating} {ratingText}
              </span>
            </div>
          </div>

          {/* Action section - Fully responsive */}
          {!isStoreOwner && (
            <div className="mt-1 sm:mt-2">
              {loading ? (
                <div className="flex items-center justify-center py-1.5 sm:py-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
                  <span className="ml-2 text-xs sm:text-xs text-gray-400 font-medium">
                    Loading...
                  </span>
                </div>
              ) : userRating !== null && userRating !== undefined && userRating > 0 ? (
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-2">
                  <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Your rating
                    </span>
                    <div className="flex items-center gap-0.5">
                      {renderStars(userRating)}
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                      {userRating}/5
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full xs:w-auto text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-200 ease-in-out border border-primary-100 hover:border-primary-200"
                  >
                    Update Rating
                  </button>
                </div>
              ) : (
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-2">
                  <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Not rated
                    </span>
                    <div className="flex items-center gap-0.5">
                      {renderStars(0)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full xs:w-auto text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-200 ease-in-out border border-primary-100 hover:border-primary-200"
                  >
                    Rate this store
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        currentRating={userRating}
        storeName={store.storeName}
      />
    </>
  );
}