import { handleLoginSv, handleLogoutSv, handleRefreshTokenSv } from '../services/auth.service';

export const handleLoginCtr = async (req, res, next) => {
  try {
    // Handle business logic
    const loginUser = req.body;
    const token = await handleLoginSv(loginUser);
    res.status(200).json({
      status: 'SUCCESS',
      data: token
    })

  } catch (err) {
    next(err);
  }
}

export const handleLogoutCtr = async (req, res, next) => {
  try {
    // Validate
    validateLogoutInput(req);

    // Handle business logic
    const { userId } = req.body;
    const token = await handleLogoutSv(userId);
    res.status(200).json({
      status: 'SUCCESS'
    });

  } catch (err) {
    next(err);
  }
}


export const handleRefreshTokenCtr = async (req, res, next) => {
  try {
    // Validate
    validateRefreshTokenInput(req);

    // Handle business logic
    const { refreshToken, userId } = req.body;
    const token = await handleRefreshTokenSv({ refreshToken, userId });
    res.status(200).json({
      status: 'SUCCESS',
      data: token
    })

  } catch (err) {
    next(err);
  }
}