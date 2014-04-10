exports.error={
DB_ERR: '1', //db error
NOT_LOGIN: '2', //未登入
APP_EXIST: '3', //app已存在(app name重複)

NETWORK: '4', //network error
CREATE_APP_PERMISSION : '5', //無建立app權限
USER_EXIST: '6', //使用者已存在(註冊時user name重複)
SUPER_EXIST: '61', //super user已存在
SUPER_REQUIRED: '62', //需要super user權限
ADMIN_REQUIRED: '63', //需要app admin權限
GROUP_MANAGER_REQUIRED: '64', //需為group manager
GROUP_EXISTS: '65', //群組已存在
SELF_REMOVAL: '66', //不能刪除自己
INVALID_UID: '7', //使用者帳號錯誤
INVALID_PWD: '8', //登入時密碼錯誤
INVALID_APP: '9', //app id有誤,db無對應之app id
CREATE_VERSION_PERMISSION: '91', //user無建立該app下version權限
INACCESSIBLE_APP: '92', //user無存取app權限
BUILD_ERR: '10', //android or ios在compile時發生錯誤
IO_ERR: '101', //io error
READER_ERR: '102', //invalid reader
CODESIGN_ERR:'103', // code sign 錯誤
BUILD_CONFIG_ERR : '11', //java端config設定有誤
SYSTEM_ERR : '111', //java端config設定有誤
IO_LOCKED : '112', //有其他人在使用，目前被鎖住
FILE_COLLISION : '12', //上傳檔案時有衝突 (檔案已存在)
COMMIT_ERR : '121', //上傳檔案commit時發生錯誤
COMMIT_UNCHANGED : '122', //上傳的檔案和當前版本完全相同，無commit必要
INVALID_VERSION : '13', //version有誤，可能該version不存在
INACCESSIBLE_VERSION : '131', //user無權限存取version
VERSION_ALREADY_BUILDED : '132', //該version已被build過
INVALID_PLIST : '133', //plist file有誤
ANDOIRD_PUSH_ERR : '134', //android push失敗 
IOS_PUSH_ERR : '135', //ios push失敗
PUSH_KEY_ERR : '136', //ios push key上傳失敗
PUSH_CERT_ERR : '137', //ios push cert上傳失敗
PUSH_ENABLE_ERR : '138', //push enable error
GOOGLE_API_INCOMPLETE: '139', //google api未設定完整
APNS_CONNECT_ERR: '140', //與apple推播連線異常
INVALID_UPLOAD_ID : '14', //upload id有誤，可能該筆資料不存在或user無權限存取
NOT_IN_EDIT : '15', //尚未進入編輯模式
ALREADY_IN_EDIT : '16', //已進入編輯模式
INVALID_TAG : '17', //tag不存在
BASE64_ENC_ERR : '18', //base64 encoding error,
INVALID_OS : '19', //os名稱錯誤
INVALID_GROUP : '192', //群組名稱錯誤
INVALID_ACCOUNT : '193', //account錯誤
INVALID_FILE : '20', //download file not found
BOOKCASE_EXIST: '21',//書櫃已存在(bookcase name重複)
CATEGORY_EXIST: '22',//類別已存在(category name重複)
APP_EXIST: '23',//App已存在(app name重複)
UPDATE_TIMEOUT: '67' //由email連結設定密碼逾期
};
