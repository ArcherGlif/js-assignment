const MESSAGE_ERROR = "проверьте валиднойсть передаваемых данных"

let allUsers        = []
let allRights       = []
let allGroups       = []
let loginUser       = ""
let loginAsUser     = ""
let listOfListener  = []

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

    allUsers[allUsers.indexOf(user)].groups.push(group)
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
function addRightToGroup(right,group) {

    //Валидация
    if (!right 
        || !group 
        || !allGroups.includes(group) 
        || !allRights.includes(right)) throwError()

    allGroups[allGroups.indexOf(group)].rights.push(right)
}

// Удаляет право right из группы group. Должна бросить исключение, если права right нет в группе group
function removeRightFromGroup(right,group) {

    //Валидация
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

    loginUser = allUsers.find(function(user){
        return (user.name === this.username && user.password == this.password)
    },{username,password}) || ""

    return !!loginUser
}

function currentUser() {
    if (loginAsUser === ""){
        if (loginUser !== "") return loginUser
    }else{
        return loginAsUser
    }
}

function logout() {
    if (loginAsUser == ""){
        loginUser = ""
    }else {
        loginAsUser = ""
    }
}
// Проверяет право right у пользователя user 
function isAuthorized(user, right) {return _isAuthorized(user,right) }
// доп функция от переполнения стека при установке прав для функции isAuthorized с помощью securityWrapper
function _isAuthorized (user,right){
    //Валидация
    if (!user 
        || !right 
        || !allUsers.includes(user) 
        || !allRights.includes(right)) throwError()

    for (group of user.groups){

        if (group.rights.includes(right)) {
            return true
        }

    }
    return false
}

// Добавляет пользователя Guest в систему
function initGuestUser(user,group,right){

    let guest       = !user  ? createUser("Guest","") : user
    let groupGuest  = !group ? createGroup("Guest")   : group
    
    addUserToGroup(guest,groupGuest)
    
    if((group && right) || right){
        let rightGuest  = createRight("Auth")
        addRightToGroup(rightGuest,groupGuest)
    }
}

// Вход под другим пользователем
function loginAs(username) {
    if (loginUser === "") return false

    let isLogingAs = allUsers.reduce(function(oldValue,value){
        return (oldValue || (value.name === username)) 
    },false)

    if ( isLogingAs ) {
        loginAsUser = allUsers.find(function(user){
            return user.name === this.username
        },{username})
    }

    return isLogingAs
}

// Проверка прав у пользователя на команду
function securityWrapper(action, right){
    return function(...resp) {
        let user = currentUser()
        if (!user){
            console.log("Авторизуйтесь!")
        } else {
            if( _isAuthorized(user,right) ){

                let result = action(...resp)

                listOfListener.forEach(function(listener){
                    listener(this.user, this.action)
                },{user,action})

                return result
            }
            console.log(`Недостаточно прав для команды ${action.name}`)
        }
    }
}

function addActionListener (listener) {
    listOfListener.push(listener)
}
