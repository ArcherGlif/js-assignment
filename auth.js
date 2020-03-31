
let root                = createUser("root","root")
let admin               = createUser("administrator","administrator")
let client1             = createUser("ignat","ignat")
let client2             = createUser("vasya","vasya")
let client3             = createUser("alex","alex")
let guest               = createUser("Гость","")

let groupAllRight       = createGroup("allRight")       //Всемогущий
let groupAdmin          = createGroup("administrator")  //Не может создавать и полность удалять пользователей,группы,права
let groupClient         = createGroup("client")         //Может только войти, выйти

let rightView           = createRight("viewAuth")       //Права на просмотр всех пользователей,групп,прав
let rightCreate         = createRight("createAuth")     //Права на создание пользователей,групп,прав
let rightDelete         = createRight("deleteAuth")     //Права на полное удление пользователей,групп,прав
let rightRelations      = createRight("relationsAuth")  //Права на добавление и удаление прав у объектов
let rightLogin          = createRight("loginAuth")      //Права на авторизацию
let rightLoginAs        = createRight("loginAsAuth")    //Права на вход под другим пользователем

// Добавляем группе allRight все права
addRightToGroup(rightView, groupAllRight)
addRightToGroup(rightCreate, groupAllRight)
addRightToGroup(rightDelete, groupAllRight)
addRightToGroup(rightRelations, groupAllRight)
addRightToGroup(rightLogin, groupAllRight)
addRightToGroup(rightLoginAs, groupAllRight)

// Добавляем группе administrator права
rightsLikeGroup(groupAdmin, groupAllRight)
removeRightFromGroup(rightLoginAs, groupAdmin)
removeRightFromGroup(rightCreate , groupAdmin)
removeRightFromGroup(rightDelete , groupAdmin)

// Добавляем группе client права
addRightToGroup(rightLogin, groupClient)

// Добавление группы для пользователям
addUserToMoreGroup(root, [groupAllRight, groupAdmin, groupClient])
addUserToMoreGroup(admin, [groupAdmin, groupClient])
addMoreUserToGroup([client1,client2,client3], groupClient)
initGuestUser(guest)



// Проверка присутсвия нужных прав у пользователей
console.log( messageCheckRightsAtUser(root, [rightView,rightCreate,rightDelete,rightRelations,rightLogin,rightLoginAs]))
console.log( messageCheckRightsAtUser(admin, [rightView,rightRelations,rightLogin]))
console.log( messageCheckRightsAtUser(client1, [rightLogin]))
console.log( messageCheckRightsAtUser(client2, [rightLogin]))
console.log( messageCheckRightsAtUser(client3, [rightLogin]))

// Действия с аутентификацией
console.log( loginWrapper("root","toor") )
console.log( loginWrapper("root","root") )
console.log( loginWrapper("ignat","ignat") )
console.log( currentUserWrapper() )
console.log( logoutWrapper() )
console.log( currentUserWrapper() )

// Разграничение функций для прав
addUserToGroup      = securityWrapper(addUserToGroup        ,rightRelations)
removeUserFromGroup = securityWrapper(removeUserFromGroup   ,rightRelations)
addRightToGroup     = securityWrapper(addRightToGroup       ,rightRelations)
removeRightFromGroup= securityWrapper(removeRightFromGroup  ,rightRelations)

users       = securityWrapper(users         ,rightView)
groups      = securityWrapper(groups        ,rightView)
rights      = securityWrapper(rights        ,rightView)
groupRights = securityWrapper(groupRights   ,rightView)
userGroups  = securityWrapper(userGroups    ,rightView)
isAuthorized= securityWrapper(isAuthorized  ,rightView)

createUser  = securityWrapper(createUser    ,rightCreate)
createGroup = securityWrapper(createGroup   ,rightCreate)
createRight = securityWrapper(createRight   ,rightCreate)

deleteUser  = securityWrapper(deleteUser    ,rightDelete)
deleteGroup = securityWrapper(deleteGroup   ,rightDelete)
deleteRight = securityWrapper(deleteRight   ,rightDelete)

loginAs     = securityWrapper(loginAs       ,rightLoginAs)

addActionListener(function(user,action){
    console.log(`Пользователь ${user.name} сделал ${action.name}`)
})

//Поиск пользователя по имени
function findUserByName(username){
    return users().find(function(user){
        return user.name === this.username
    },{username})
}

// Добавляет группе groupInit все права которые есть у группы likeGroup
function rightsLikeGroup (groupInit,likeGroup){
    for (right of groupRights(likeGroup)){
        addRightToGroup(right, groupInit)
    }
}

// Добавляет пользователя user во все группы groups
function addUserToMoreGroup (user,groups){
    for (group of groups){
        addUserToGroup(user,group)
    }
}

// Добавляет всех пользователей users в группу group 
function addMoreUserToGroup (users,group){
    for (user of users){
        addUserToGroup(user,group)
    }
}

// Проверка на наличие прав rights у пользователя user 
function isRightsAtUser (user,rights){
    return rights.reduce(function(is,right){
        return (is && isAuthorized(user,right))
    },true)
}

// Сообщение о состоянии нужных прав rights у пользователя user
function messageCheckRightsAtUser(user,rights){
    if (isRightsAtUser(user, rights)){
        return `Права для ${user.name} выданы успешно!`
    }else{
        return `У пользователя ${user.name} отсутсвуют нужные права!`
    }
}

// Обертка для входа в систему
function loginWrapper(username, password){
    let user = currentUser()
    return user ? `Вы уже вошли под ${user.name}` : login(username,password) ? `Добро пожаловать ${username}!` : "Введен неверный логин или пароль!" 
}

// Обертка получения текущего пользователя
function currentUserWrapper () {
    let loginUser = currentUser()
    if (loginUser) {
        return `Текущий пользователь : ${loginUser.name}`
    }
    return "Текущего пользоателя нет"
}

// Оборетка выхода из системы
function logoutWrapper(){logout(); return "Произведен выход из сиситемы"}