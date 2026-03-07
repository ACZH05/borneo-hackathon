"use client";

import React, { Component } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CallIcon from "@mui/icons-material/Call";

export default class EmergencyDetailsComponent extends Component {
  render() {
    return (
      <div className="flex flex-col bg-primary text-surface rounded-2xl p-4 gap-4 transition hover:-translate-1 cursor-pointer">
        <div className="flex justify-between font-bold">
          EMERGENCY DETAILS
          <ArrowForwardIosIcon />
        </div>
        <div className="flex gap-4">
          <div className="">
            <span className="text-xs">NAME</span>
            <br />
            <span className="font-bold">Alfred Chin Zhan Hoong</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs">EMERGENCY CONTACT</span>
            <span className="font-bold">Alfred Chin Zhan Hoong (Brother)</span>
            <div className="items-center text-xs">
              <CallIcon fontSize="small" />
              +6012-3456789
            </div>
          </div>
        </div>
      </div>
    );
  }
}
