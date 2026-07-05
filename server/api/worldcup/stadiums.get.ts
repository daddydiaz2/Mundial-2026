export default defineEventHandler(async () => {
  const data = await $fetch('https://worldcup26.ir/get/stadiums')
  return data
})
