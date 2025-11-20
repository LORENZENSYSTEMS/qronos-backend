import bcrypt from 'bcryptjs'

export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10) // Puedes ajustar el número de rondas
  const hashedPassword = await bcrypt.hash(plainPassword, salt)
  return hashedPassword
}

export const verifyPassword = async (plainPassword ,hashed) => {
  return await bcrypt.compare(plainPassword, hashed)
}