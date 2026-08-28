export class JwtService {
  constructor(jwt) {
    this.jwt = jwt;
  }

  signAccessToken(payload) {
    return this.jwt.sign(payload, { expiresIn: '1d' });
  }
}