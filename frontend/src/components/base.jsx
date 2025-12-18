<div className="form-container">
  {loading === true && <p>LOADING ....</p>}
  {loading === false && (
    <div>
      <p>{shareInfo}</p>
    </div>
  )}
</div>;

<div className="form-container">
  <p>
    Share Number CERT--{shares.share_number} ... acquisition_price{" "}
    {shares.acquisition_price} .... vpp {shares.share_vpp}
  </p>
  <button
    onClick={() => navigate(`/sharetransfer/${shares.id}`)}
    className="delete-button"
  >
    transfer it !
  </button>
</div>;
