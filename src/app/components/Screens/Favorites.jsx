import React from "react";
import { SalesInfoCard } from "../Reusable/Card";
import Header from "../Header/Header";

const Favorites = ({ data, profileType }) => {
  let url = {};
  if (profileType === "buyer") {
    url = `/service-info/`;
  } else {
    url = `/mission/`;
  }
  return (
    <div className="w-[95%] mx-auto my-5">
      <Header heading={{ title: "Favorites" }} showSearchBar={false} />
      <div className="space-y-4 mt-5">
        {data && data.map((item) => <SalesInfoCard key={item._id} data={item} routePrefix={`${url}`} />)}
        {(!data || data.length === 0) && (
          <p className="text-gray-500 text-xl text-center py-[40%] sm:py-[15%]">
            You don't have any favorites yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Favorites;
