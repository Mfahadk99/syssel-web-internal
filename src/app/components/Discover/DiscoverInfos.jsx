import React from "react";
import { ReusableInfoCard, ServiceInfoCard, SalesInfoCard } from "../Reusable/Card";

const DiscoverInfos = ({ data, activetab }) => {
  console.log("data", data);
  return (
    <div>
      {data.map((item, index) => (
        <div className="mb-4" key={index}>
          {activetab === "stores" && <ReusableInfoCard item={item} />}
          {activetab === "services" && <ServiceInfoCard data={item} />}
          {activetab === "sales" && <SalesInfoCard data={item} />}
          {activetab === "" && <ReusableInfoCard item={item} />}
        </div>
      ))}
    </div>
  );
};

export default DiscoverInfos;
