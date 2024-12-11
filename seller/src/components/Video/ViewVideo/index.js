import styles from "./ViewVideo.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);
function ViewVideo({ setDisplayVideo, source }) {
  return (
    <div className={cx("container-mask")}>
      <div className={cx("container")}>
        <div className={cx("heading-container")}>
          <h1 className={cx("title")}>View Video</h1>
          <button
            className={cx("exitButton")}
            onClick={() => setDisplayVideo(false)}
          >
            X
          </button>
        </div>
        <div className={cx("video-container")}>
          <video src={source} controls />
        </div>
      </div>
    </div>
  );
}

export default ViewVideo;
