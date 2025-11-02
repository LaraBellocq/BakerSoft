import PropTypes from 'prop-types';
import clsx from 'clsx';

function CardResumen({ title, value, accent, helper, children, className }) {
  return (
    <article className={clsx('db-card', accent && `db-card-${accent}`, className)}>
      <header className="db-card-header">
        <h3 className="db-card-title">{title}</h3>
        {helper ? <span className="db-card-helper">{helper}</span> : null}
      </header>
      <div className="db-card-body">
        {children ?? <span className="db-card-value">{value}</span>}
      </div>
    </article>
  );
}

CardResumen.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  accent: PropTypes.oneOf(['warning', 'success', 'neutral']),
  helper: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

CardResumen.defaultProps = {
  value: undefined,
  accent: undefined,
  helper: undefined,
  children: undefined,
  className: undefined,
};

export default CardResumen;
