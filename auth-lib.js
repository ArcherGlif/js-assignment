const MESSAGE_ERROR = "проверьте валиднойсть передаваемых данных"

let allUsers    = []
let allRights   = []
let allGroups   = []
let loginUser   = ""

let throwError  = () => { throw new Error(MESSAGE_ERROR) }

function User   (name, password){ this.name = name; this.password = password; this.groups = [] }
function Group  (name)          { this.name = name; this.rights   = [] }
function Right  (name)          { this.name = name; }

// Возвращает массив всех пользователей.
function users() { 
    return allUsers
}

// Создает нового пользователя с указанным логином username и паролем password, возвращает созданного пользователя.
function createUser(name, password) {
    let user = new User(name, password)
    allUsers.push(user)
    return user
}

// Удаляет пользователя user
function deleteUser(user) {
    //Валидация
    if(!user || !allUsers.includes(user)) throwError()

    allUsers.splice(allUsers.indexOf(user),1)
}

// Возвращает массив групп, к которым принадлежит пользователь user
function userGroups(user) { return user.groups }

// Добавляет пользователя user в группу group
function addUserToGroup(user, group) {

    //Валидация
    if (!user 
        || !group 
        || !allGroups.includes(group)
        || !allUsers.includes(user)) throwError()

    // console.log(user,group)

    allUsers[allUsers.indexOf(user)].groups.push(group)
    // allUsers = allUsers.map(function(user){

    //     if(user.name == this.user.name){
    //         user.groups.push(this.group.groupName)
    //     }

    //     return user

    // },{user,group})
}

// Удаляет пользователя user из группы group. Должна бросить исключение, если пользователя user нет в группе group
function removeUserFromGroup(user, group) {

    //Валидация
    if (!user 
        || !group 
        || !allGroups.includes(group)
        || !allUsers.includes(user)
        || !allUsers[allUsers.indexOf(user)].groups.includes(group)) throwError()

    let idGroup = allUsers[allUsers.indexOf(user)].groups.indexOf(group)
    allUsers[allUsers.indexOf(user)].groups.splice(idGroup,1)
}

// Возвращает массив прав
function rights() {
    return allRights
}

// Создает новое право с именем name и возвращает его
function createRight(name) {
    let right = new Right (name)
    allRights.push(right)
    return right
}

// Удаляет право right
function deleteRight(right) {
    //Валидация
    if(!right || !allRights.includes(right)) throwError()
    
    allRights.splice(allRights.indexOf(right),1)
    allGroups.map(function(group){
        if (group.rights.includes(this.right)) {
            group.rights.splice(group.rights.indexOf(right))
        }
        return group
    },{right})
}

// Возвращает массив групп
function groups() {
    return allGroups
}

// Создает новую группу и возвращает её.
function createGroup(name) {
    let group = new Group(name)
    allGroups.push(group)
    return group
}

// Удаляет группу group
function deleteGroup(group) {
    //Валидация
    if(!group || !allGroups.includes(group)) throwError()

    allGroups.splice(allGroups.indexOf(group),1)
    allUsers.map(function(user){
        if (user.groups.includes(this.group)) {
            user.groups.splice(user.groups.indexOf(group))
        }
        return user
    },{group})
}

// Возвращает массив прав, которые принадлежат группе group
function groupRights(group) {
    return group.rights
}

// Добавляет право right к группе group
function addRightToGroup(...resp) {
    let {0:right, 1:group} = resp
    //Валидация
    if (!right 
        || !group 
        || !allGroups.includes(group) 
        || !allRights.includes(right)) throwError()

    allGroups[allGroups.indexOf(group)].rights.push(right)
}

// Удаляет право right из группы group. Должна бросить исключение, если права right нет в группе group
function removeRightFromGroup(...resp) {
    let {0:right, 1:group} = resp

    if (!right 
        || !group 
        || !allGroups.includes(group) 
        || !allRights.includes(right)
        || !allGroups[allGroups.indexOf(group)].rights.includes(right) ) throwError()

    let idRight = allGroups[allGroups.indexOf(group)].rights.indexOf(right)
    allGroups[allGroups.indexOf(group)].rights.splice(idRight,1)

}

function login(username, password) {

    if (loginUser !== "") return false

    let isLoging = allUsers.reduce(function(oldValue,value){
        return (oldValue || (value.name == username && value.password == password )) 
    },false)

    if ( isLoging ) {
        loginUser = allUsers.find(function(user){
            return user.name === username
        },{username})
    }

    return isLoging
}

function currentUser() {
    if (loginUser !== "") return loginUser
}

function logout() {
    loginUser = ""
}

function isAuthorized(user, right) {}
