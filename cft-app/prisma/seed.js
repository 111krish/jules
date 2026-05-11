import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = [
    { name: 'CEO', email: 'ceo@carbonfueltech.com', role: 'CEO' },
    { name: 'COO', email: 'coo@carbonfueltech.com', role: 'COO' },
    { name: 'Rahul', email: 'rahul@carbonfueltech.com', role: 'CTO' },
    { name: 'Dr. Vineet', email: 'vineet@carbonfueltech.com', role: 'HEAD_OF_RESEARCH' },
    { name: 'Dr. Revathy', email: 'revathy@carbonfueltech.com', role: 'PROJECT_HEAD' },
    { name: 'Intern 1', email: 'intern1@carbonfueltech.com', role: 'INTERN' },
    { name: 'Intern 2', email: 'intern2@carbonfueltech.com', role: 'INTERN' },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  // Set manager for interns
  const interns = await prisma.user.findMany({ where: { role: 'INTERN' } })
  const revathy = await prisma.user.findUnique({ where: { email: 'revathy@carbonfueltech.com' } })

  if (revathy) {
    for (const intern of interns) {
      await prisma.user.update({
        where: { id: intern.id },
        data: { managerId: revathy.id }
      })
    }
  }

  // Create a default project
  await prisma.project.create({
    data: {
      name: 'SIE-IITM Seed Grant',
      description: 'Design validation, pilot deployments, and scale-up prep',
      status: 'ACTIVE'
    }
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
