const APIURL = 'https://api.github.com/users/'

async function getUser() {
    const resp = await fetch(APIURL + user)
    const respData = await resp.json()

    createUserCard(respData)
}