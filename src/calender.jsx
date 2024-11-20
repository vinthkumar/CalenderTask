import React, { useEffect, useState } from "react";

function Calender(props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("./calander-json/calendarfromtoenddate.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData) => setData(jsonData))
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []);

  return (
    <div>
      <h2>Fetch Data</h2>
      {data ? (
        <div>
          <h3>Data:</h3>
          {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
          {Array.isArray(data) ? (
            data.map((item, index) => (
              <div
                key={index}
                style={{ border: "2px solid", padding: "5px", margin: "10px" }}
              >
                <p>{item.user_det?.job_id?.jobRequest_Title || "N/A"}</p>
                <p>{item.user_det?.handled_by?.username || "N/A"}</p>
                <p>{item.user_det?.job_id?.jobRequest_createdOn || "N/A"}</p>
              </div>
            ))
          ) : (
            <p>
              <strong>Handled By:</strong>{" "}
              {data.user_det?.handled_by?.username || "N/A"}
            </p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Calender;
