import React from "react";

function Page() {
  return (
    <div className="h-full grid grid-cols-2 grid-rows-5 gap-4 my-6">
      <div className="row-span-4 bg-primary">1</div>
      <div className="row-span-2 bg-accent">2</div>
      <div className="row-span-2 col-start-2 row-start-3 bg-accent">3</div>
      <div className="col-span-2 row-start-5 bg-accent">4</div>
    </div>
  );
}

export default Page;
