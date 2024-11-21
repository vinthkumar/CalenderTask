import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";

const localizer = momentLocalizer(moment);

function CalendarComponent() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [overlappingEvents, setOverlappingEvents] = useState([]);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    fetch("/calander-json/calendarfromtoenddate.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData) => {
        const mappedEvents = Array.isArray(jsonData)
          ? jsonData.map((item) => ({
              id: item.id || "ID not Found",
              title: item.user_det?.job_id?.jobRequest_Title || "No Title",
              start: new Date(item.start || Date.now()),
              end: new Date(item.end || Date.now()),
              allDay: false,
              user: item.user_det?.handled_by?.username || "No user",
              summary: item.summary || "No user",
              candidate:
                item.user_det?.candidate?.candidate_firstName ||
                "candidate not found",
              meetinglink: item.link || "No meeting Links",
            }))
          : [];
        const groupedEvents = groupOverlappingEvents(mappedEvents);
        setEvents(groupedEvents);
      })
      .catch((error) => console.error("Error fetching JSON:", error));
  }, []);

  const groupOverlappingEvents = (events) => {
    const grouped = [];
    events.forEach((event) => {
      let foundGroup = false;
      for (let group of grouped) {
        if (
          moment(group[0].start).isBetween(
            event.start,
            event.end,
            null,
            "[)"
          ) ||
          moment(group[0].end).isBetween(event.start, event.end, null, "(]") ||
          moment(event.start).isBetween(
            group[0].start,
            group[0].end,
            null,
            "[)"
          ) ||
          moment(event.end).isBetween(group[0].start, group[0].end, null, "(]")
        ) {
          group.push(event);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        grouped.push([event]);
      }
    });

    return grouped.map((group) => ({
      ...group[0],
      count: group.length,
      overlappingEvents: group,
    }));
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOverlappingEvents(event.overlappingEvents || []);
  };

  const EventWithNotification = ({ event }) => (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: "0.85em" }}>{event.title}</div>
      <div style={{ fontSize: "0.75em" }}>Interviewer: {event.user}</div>
      <div style={{ fontSize: "0.75em" }}>
        {moment(event.start).format("h:mm A")} to{" "}
        {moment(event.end).format("h:mm A")}
      </div>

      {event.count > 1 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "gold",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8em",
            fontWeight: "bold",
          }}
        >
          {event.count}
        </div>
      )}
    </div>
  );

  const handleShowMore = () => {
    return;
  };

  const handleEventDetailClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const LinkEventClick = (event) => {
    if (selectedEvent.meetinglink) {
      window.open(selectedEvent.meetinglink, "_blank", "noopener noreferrer");
    } else {
      alert("Meeting link is not available.");
    }
  };

  const closeEventDetailPopup = () => {
    setShowEventDetail(false);
  };

  const CustomToolbar = (toolbar: any) => {
    const goToView = (viewType: string) => {
      setView(viewType);
      setSelectedEvent(null);
    };

    const isActiveView = (viewType: string) => {
      return view === viewType;
    };

    let label = toolbar.label;
    if (view === Views.WEEK) {
      const startOfWeek = moment(toolbar.date)
        .startOf("week")
        .format("Do MMMM ");
      const endOfWeek = moment(toolbar.date)
        .endOf("week")
        .format("Do MMMM , YYYY");
      label = `${startOfWeek} to ${endOfWeek}`;
    }

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button
            style={{
              border: "2px solid #848080",
              padding: "5px 10px",
              backgroundColor: "#fff",
              cursor: "pointer",
              borderRadius: "5px",
              margin: "10px",
              fontSize: "20px",
              fontWeight: "700",
              color: "#ccc",
            }}
            onClick={() => {
              toolbar.onNavigate("PREV");
              setSelectedEvent(null);
            }}
          >
            {"<"}
          </button>
          <button
            style={{
              border: "2px solid #848080",
              padding: "5px 10px",
              backgroundColor: "#fff",
              cursor: "pointer",
              borderRadius: "5px",
              marginLeft: "10px",
              fontSize: "20px",
              fontWeight: "700",
              color: "#ccc",
            }}
            onClick={() => {
              toolbar.onNavigate("NEXT");
              setSelectedEvent(null);
            }}
          >
            {">"}
          </button>
        </span>
        <span className="rbc-toolbar-label">{label}</span>
        <span className="rbc-btn-group">
          <button
            style={{
              fontWeight: "600",
              border: isActiveView(Views.DAY) ? "0px solid #2a7ad2" : "none",
              borderBottom: isActiveView(Views.DAY)
                ? "3px solid #2a7ad2"
                : "none",
            }}
            onClick={() => goToView(Views.DAY)}
          >
            Day
          </button>
          <button
            style={{
              fontWeight: "600",
              border: isActiveView(Views.WEEK) ? "0px solid #2a7ad2" : "none",
              borderBottom: isActiveView(Views.WEEK)
                ? "3px solid #2a7ad2"
                : "none",
            }}
            onClick={() => goToView(Views.WEEK)}
          >
            Week
          </button>
          <button
            style={{
              fontWeight: "600",
              border: isActiveView(Views.MONTH) ? "0px solid #2a7ad2" : "none",
              borderBottom: isActiveView(Views.MONTH)
                ? "3px solid #2a7ad2"
                : "none",
            }}
            onClick={() => goToView(Views.MONTH)}
          >
            Month
          </button>
          <button
            style={{
              fontWeight: "600",
              border: isActiveView(Views.YEAR) ? "0px solid #2a7ad2" : "none",
              borderBottom: isActiveView(Views.YEAR)
                ? "3px solid #2a7ad2"
                : "none",
            }}
            onClick={() => goToView(Views.YEAR)}
          >
            Year
          </button>
        </span>
      </div>
    );
  };

  return (
    <div className="calendar-container" style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onShowMore={handleShowMore}
          style={{ height: "90vh", margin: "20px", padding: "10px" }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.YEAR]}
          view={view}
          components={{
            event: EventWithNotification,
            toolbar: CustomToolbar,
          }}
        />
      </div>
      {selectedEvent && !showEventDetail && (
        <div
          className="event-details"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-78%, 0%)",
            width: "350px",
            maxHeight: "200px",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            zIndex: 9999,
            padding: "10px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #ccc",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>Meetings</h3>
            <button
              style={{
                backgroundColor: "#265985",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "100px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedEvent(null)}
            >
              X
            </button>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              fontSize: "12px",
              margin: 0,
              overflowY: "auto",
              flex: 1,
              paddingRight: "5px",
            }}
          >
            {overlappingEvents.map((event, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "20px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <strong
                  style={{
                    fontSize: "1.3em",
                    marginBottom: "5px",
                    display: "block",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEventDetailClick(event)}
                >
                  {event.title}
                </strong>
                <div style={{ marginBottom: "10px" }}>
                  <span>{event.summary}</span>
                  <span style={{ marginLeft: "10px" }}>
                    | Interviewer: {event.user}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>
                    Date: {moment(event.start).format("D MMMM, YYYY")}
                  </span>
                  <span>
                    Time: {moment(event.start).format("h:mm A")} -{" "}
                    {moment(event.end).format("h:mm A")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showEventDetail && (
        <div
          className="overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      {showEventDetail && selectedEvent && (
        <div
          className="event-detail-popup"
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "10px",
            boxShadow: "0px 0px 15px rgba(0,0,0,0.1)",
            zIndex: 1000,
            width: "500px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <button
            style={{
              backgroundColor: "#265985",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: "100px",
              cursor: "pointer",
              float: "right",
              position: "absolute",
              top: 0,
              right: 0,
            }}
            onClick={closeEventDetailPopup}
          >
            X
          </button>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 150px",
              gap: "20px",
              alignItems: "center",
              border: "1px solid #ccc",
              paddingLeft: "10px",
            }}
          >
            <div style={{ borderRight: "1px solid #ccc" }}>
              <p>
                <strong>Interview with:</strong> {selectedEvent.candidate}
              </p>
              <p>
                <strong>Position:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Created By:</strong> {selectedEvent.user}
              </p>
              <p>
                <strong>Interview Date:</strong>{" "}
                {moment(selectedEvent.start).format("D MMMM, YYYY")}
              </p>
              <p>
                <strong>Interview Time:</strong>{" "}
                {moment(selectedEvent.start).format("h:mm A")} -{" "}
                {moment(selectedEvent.end).format("h:mm A")}
              </p>
              <p style={{ marginTop: "20px" }}>
                <strong>Interview Via: </strong>Google Meet
              </p>
              <p>
                <strong>Link: </strong>
                {selectedEvent.meetinglink ? (
                  <a
                    href={selectedEvent.meetinglink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {selectedEvent.meetinglink}
                  </a>
                ) : (
                  "No link available"
                )}
              </p>
              <button className="custom-button">
                Resume Docx
                <span className="icon" style={{ paddingLeft: "15px" }}>
                  &#128065;
                </span>
                <span className="icon">&#10515;</span>
              </button>
              <button
                className="custom-button"
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                AatharCard
                <span className="icon" style={{ paddingLeft: "35px" }}>
                  &#128065;
                </span>
                <span className="icon">&#10515;</span>
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div>
                <img
                  src="/google_meet_icon.png"
                  alt="Google Meet"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "contain",
                    border: "1px solid #ccc",
                    padding: "5px",
                  }}
                />
              </div>
              <button
                style={{
                  backgroundColor: "#005dad",
                  padding: "6px 20px 6px 20px",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
                onClick={LinkEventClick}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarComponent;
