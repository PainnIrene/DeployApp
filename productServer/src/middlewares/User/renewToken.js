const renewToken = (req, res, next) => {
  if (req.newAT) {
    res.cookie("AT", req.newAT, {
      httpOnly: false,
      secure: false,
      maxAge: 1800000, // 30 mins
      sameSite: "lax",
    });
    console.log("Renew ToKENNNN");
  }
  // console.log("thoi gian het han: ", req.expireRT);
  if (req.newRT) {
    res.cookie("RT", req.newRT, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
  }
  next();
};
export default renewToken;
