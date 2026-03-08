"use client";

import React, { Component } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FilterHdrOutlinedIcon from "@mui/icons-material/FilterHdrOutlined";

class AlertComponent extends Component {
  render() {
    return (
      <div className="flex gap-5 bg-white rounded-2xl p-8 shadow">
        <div className="">
          <div className="bg-warning/10 p-2 rounded-xl">
            <FilterHdrOutlinedIcon className="text-warning" />
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-2xl font-bold">
            Landslide Caution: Highlands
          </span>
          <span className="text-textGrey">
            Soil stability is currently low due to rain. Avoid steep slopes.
          </span>
        </div>
        <div className="">
          <div className="bg-warning/10 text-warning text-xs font-bold px-2 py-1 rounded-md">
            CAUTION
          </div>
        </div>
      </div>
    );
  }
}

export default class LatestAlert extends Component {
  render() {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CampaignIcon fontSize="small" className="text-primary" />
            </div>
            <span className="text-2xl font-bold">Latest Alerts</span>
          </div>
          {/* For archieve link */}
          <div className=""></div>
        </div>

        <div className="flex p-8 gap-8 bg-white border-l-10 border-priority rounded-2xl shadow">
          <div className="w-full bg-primary/10">Map</div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-3 items-center">
              <div className="flex gap-1 items-center bg-priority/10 rounded-full px-4 py-1">
                <WarningAmberOutlinedIcon
                  fontSize="small"
                  className="text-priority"
                />
                <span className="text-xs font-black text-priority">
                  PRIORITY
                </span>
              </div>
              <div className="text-xs text-textGrey/60">10:00pm</div>
            </div>
            <div className="flex gap-2 items-center">
              <WaterDropOutlinedIcon className="text-blue-500" />
              <span className="text-2xl font-bold">
                Flood Adivisory: Mahakam Basin
              </span>
            </div>
            <div className="text-textGrey">
              Water levels are rising in the Mahakam river basin. Community
              Shelter 4 (Sector 4) and Shelter 7 are open with food and medical
              supplies. Please move to higher ground calmly.
            </div>
            <div className="flex gap-6">
              <div className="flex gap-2">
                <FmdGoodOutlinedIcon className="text-primary" />
                <span className="text-textGrey/60">Samarinda Area</span>
              </div>
              <div className="flex gap-2 text-priority">
                <PeopleOutlinedIcon className="" />
                <span>Est. 4,500 people at risk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <AlertComponent></AlertComponent>
        </div>
      </div>
    );
  }
}
