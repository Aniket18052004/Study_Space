import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

// Only initialize Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id.apps.googleusercontent.com') {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value
                    const avatar = profile.photos[0]?.value

                    // Check if user already exists
                    let user = await User.findOne({ email })

                    if (user) {
                        // If user registered with email before, link Google account
                        if (!user.googleId) {
                            user.googleId = profile.id
                            user.authMethod = 'google'
                            if (!user.avatar) user.avatar = avatar
                            await user.save()
                        }
                        return done(null, user)
                    }

                    // Create brand new Google user
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        googleId: profile.id,
                        avatar,
                        authMethod: 'google',
                        isVerified: true,
                    })

                    done(null, user)
                } catch (err) {
                    done(err, null)
                }
            }
        )
    )
}

export default passport