import React from 'react';
import { Link } from 'react-router-dom';
import SportIcon, { getSportColor, getSportLabel } from './SportIcon';
import { countdownLabel, formatDatePL, getDifficultyLabel } from '../utils';

function EventCard({ event }) {
  const color = getSportColor(event.sport_type);

  return (
    <Link to={`/event/${event.slug}`} className="event-card">
      <div
        className="event-card-thumb"
        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
      >
        <span className="sport-badge" style={{ background: `${color}22`, color }}>
          <SportIcon type={event.sport_type} size={14} />
          {getSportLabel(event.sport_type)}
        </span>
        <span className="countdown-badge">{countdownLabel(event.date_start)}</span>
      </div>
      <div className="event-card-body">
        <div className="event-card-name">{event.name}</div>
        <div className="event-card-meta">
          <span>{formatDatePL(event.date_start)}</span>
          <span>{event.city}</span>
          {event.distance && <span>{event.distance}</span>}
        </div>
        {event.difficulty && (
          <span className="difficulty-badge">{getDifficultyLabel(event.difficulty)}</span>
        )}
      </div>
      <div className="event-card-footer">
        <span className="event-price">
          {event.price ? `${event.price} zł` : 'Bezpłatne'}
        </span>
        <span className="event-card-link" style={{ color }}>Zobacz →</span>
      </div>
    </Link>
  );
}

export default React.memo(EventCard);
