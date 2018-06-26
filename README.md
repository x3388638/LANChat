<h1 align="center"> <br><img src="logo/logotype.png?raw=true" alt="nabo" width="512"> <br>


# LANChat
[Project and README are both WIP]  
  
基於無線區網群播之 Ad Hoc 群組通訊  
Ad Hoc Group Communication Based on Multicast in Wireless LAN  
  
即運作於區網間不需要對外網路的分散式通訊軟體，  
使用者將裝置連至同一 WiFi 即可通訊。  
  
系統內以**群組**作為通訊單位，  
其中包含 LOBBY (公開群組)可與網路內所有使用者形成 Ad Hoc 群組並通訊，  
以及使用者自行創建的私人群組。

私人群組內之訊息傳遞皆經過加密處理，  
使用者於群組內可取得由群組資訊與加密金鑰組成之 QR Code，  
其他使用者透過掃描 QR Code 方可加入群組。  

## Special thanks
Logo designed by [ihtiht](https://github.com/ihtiht).

## 目錄
- [特色](#特色)
- [安裝方式](#安裝方式)
- [測試環境](#測試環境)
- [系統畫面](#系統畫面)
    - [登入](#登入)
    - [群組列表](#群組列表-主頁面)
    - [個人資料](#個人資料)
    - [掃描 QR Code](#掃描-qr-code-加入群組)
    - [創建群組](#創建群組)
    - [群組頁面](#群組頁面)
    - [發送緊急訊息](#發送緊急訊息)
- [資料格式](#資料格式)
    - [封包](#封包)
    - [儲存](#儲存-asyncstorage--global)

## 特色
- 支援 Android、iOS 雙系統
- 離線聊天，不須對外網路
- 分散式，無中央伺服器
- Ad Hoc 隨意群組
- 訊息加密
- 訊息形式支援純文字、圖片、檔案 (WIP)、票選活動、緊急訊息
- 一鍵發送緊急訊息

## 安裝方式
### 1. 依照官方文件架設環境
https://facebook.github.io/react-native/docs/getting-started.html Building Projects with Native Code
- Android
    - react-native-cli
    - Java JDK
    - Android Studio
- iOS
    - react-native-cli
    - watchman
    - Xcode

### 2. clone project
`git clone https://github.com/x3388638/LANChat.git`

### 3. 安裝 node modules
```
cd LANChat
npm install
```

### 4. 在實機上執行
https://facebook.github.io/react-native/docs/running-on-device.html

Android:
```
adb devices
react-native run-android
```

iOS:
使用 Xcode 開啟

## 測試環境
MacOS:
```
MacOS: 10.13.4
Xcode: 9.3
Java JDK: 1.8.0
nodejs: 6.11.3
npm: 6.0.1
React: 16.3.1
React Native: 0.55.3
react-native-cli: 2.0.1
iOS device(s): MGAA2TA/A (11.3.1)
Android device(s): SM-T700 (5.0.2)、ASUS_Z00AD (5.0)、SGP312 (5.0.2)、C5502 (5.0.2)
```

Ubuntu:
```
Ubuntu: 16.04
Java JDK: 1.8.0
nodejs: 6.11.3
npm: 3.10.10
React: 16.3.1
React Native: 0.55.3
react-native-cli: 2.0.1
Android device(s): ASUS_Z00AD (5.0)
```

## 系統畫面
### 登入
<img src="https://i.imgur.com/VOYLIVn.jpg" height="400"> <img src="https://i.imgur.com/JVbYZzm.jpg" height="400">

### 群組列表 (主頁面)
<img src="https://i.imgur.com/gC3JvOq.png" height="400"> <img src="https://i.imgur.com/3zZV3tZ.png" height="400">

### 個人資料
<img src="https://i.imgur.com/8oYY4bv.jpg" height="400">

### 掃描 QR Code (加入群組)
<img src="https://i.imgur.com/8AIoFSz.jpg" height="400">

### 創建群組
<img src="https://i.imgur.com/unpuY9H.jpg" height="400">

### 群組頁面
<img src="https://i.imgur.com/rgC2ufY.png" height="400"> <img src="https://i.imgur.com/aRqIYlR.png" height="400"> <img src="https://i.imgur.com/x3cDR5R.png" height="400">
  
<img src="https://i.imgur.com/tSqYzHZ.png" height="400"> <img src="https://i.imgur.com/kTZBfc7.png" height="400"> <img src="https://i.imgur.com/RQEKn6A.png" height="400">
  
<img src="https://i.imgur.com/XPJdwhR.png" height="400"> <img src="https://i.imgur.com/QtLYQNw.png" height="400"> <img src="https://i.imgur.com/tQ2Yihn.png" height="400">

### 發送緊急訊息
<img src="https://i.imgur.com/Q4G4rTt.png" height="400">

## 資料格式
### 封包
#### `alive` (udp)
```
{
    type: 'alive',
    paylaod: {
        ip: 'string'
    }
}
```

#### `userData` (tcp)
```
{
    type: 'userData',
    payload: {
        uid: 'string',
        data: {
            username: 'string',
            selfIntro: 'string',
            uid: 'string'
        },
        joinedGroups: {
            [group ID]: 'encrypted groupID string'
        }
    }
}
```

#### `msg` (tcp)
encrypted
```
{
    type: 'msg',
    payload: {
        groupID: 'string',
        encryptedID: 'encrypted groupID string',
        data: Encrypt('group key string', JSON.stringify({
            key: 'msg id string',
            sender: 'user id string',
            timestamp: 'ISO 8601 string',
            type: 'text" || 'poll' || 'vote' || 'img' || 'file',
            [type]: 'string' || 'img base64 string' || file Buffer
        }))
    }
}
```

plain text
```
{
    type: 'msg',
    payload: {
        groupID: 'LOBBY',
        data: {
            key: 'msg id string',
            sender: 'user id string',
            timestamp: 'ISO 8601 string',
            type: 'text' || 'emergency' || 'poll' || 'vote' || 'img' || 'file',
            [type]: 'string' || 'img base64 string' || file Buffer
        }
    }
}
```

type: text
```
text: 'string'
```

type: emergency
```
emergency: 'string'
```

type: img
```
img: 'base64 string'
```

type: poll
```
poll: {
    pollID: 'uuid',
    title: 'string',
    desc: 'string',
    options: [
        {
            id: 'option id string',
            text: 'string'
        }
    ]
}
```

type: vote
```
vote: {
    voteID: 'vote id string',
    pollID: 'poll id string',
    optionID: 'option id string'
}
```

#### `msgSync` (tcp)
```
{
    type: 'msgSync',
    payload: {
        [groupID]: {
            encryptID: 'encrypted groupID string',
            messages: Encrypt('group key string', JSON.stringify([
                {
                    key: 'msg id string',
                    sender: 'user id string',
                    timestamp: 'ISO 8601 string',
                    type: 'text' || 'poll' || 'vote' || 'img' || 'file',
                    [type]: 'string' || 'img base64 string' || file Buffer
                }
            ]))
        },
        'LOBBY': {
            messages: JSON.stringify([
                {
                    key: 'msg id string',
                    sender: 'user id string',
                    timestamp: 'ISO 8601 string',
                    type: 'text' || 'poll' || 'vote' || 'img' || 'file',
                    [type]: 'string' || 'img base64 string' || file Buffer
                }
            ])
        }
    }
}
```

### 儲存 (AsyncStorage & global)
### @LANChat:personalInfo
```
{
    normal: {
        username: 'string',
        selfIntro: '+string',
        uid: 'hash(deviceID)'
    },
    emergency: {
        name: '+string',
        birth: '+string',
        phone: '+string',
        gender: '+string ("F" || "M")',
        bloodType: '+string ("A" || "B" || "AB" || "O")',
        address: '+string',
        memo: '+string'
    }
}
```

### @LANChat:joinedGroups
```
{
    [bssid]: {
        [groupID]: {
            groupID: 'string',
            groupName: 'string',
            groupDesc: 'string',
            key: 'string',
            net: {
                ssid: 'string',
                bssid: 'string'
            },
            createdTime: 'ISO 8601 string'
        }
    }
}
```

### @LANChat:messages
```
{
    [bssid]: {
        [groipID]: {
            [msgID]: {
                key: 'msg id string',
                read: 'boolean',
                sender: 'user id string',
                timestamp: 'ISO 8601 string',
                type: 'text' || 'img' || 'file',
                [type]: 'string' || 'img base64 string' || file Buffer
            }
        }
    }
}
```

### @LANChat:users
```
{
    [uid]: {
        uid: 'string',
        username: 'string',
        selfIntro: 'string',
        lastSeen: 'ISO 8601 string',
        joinedGroups: ['group ID string']
    }
}
```

### @LANChat:poll
```
{
    [pollID]: {
    	bssid: 'string',
        groupID: 'group id string',
        creater: 'user id string',
        title: 'string',
        desc: 'string',
        timestamp: 'ISO 8601 string',
        options: [
            {
                id: 'option id string'
                text: 'string'
            }
        ]
    }
}
```

### @LANChat:vote
```
{
    [voteID]: {
        bssid: 'bssid',
        groupID: 'group id string',
        pollID: 'poll id string',
        optionID: 'option id string',
        voter: 'user id string',
        timestamp: 'ISO 8601 string'
    }
}
```

### global.netUsers
```
{
    [ip]: {
        uid: 'user id string',
        username: 'string',
        selfIntro: 'string',
        lastSeen: 'ISO 8601 string',
        ip: 'string',
        tcpSocket: 'net socket'
    }
}
```
