<?php
require_once('admin/mysqlconn.php');
$sql = "SELECT userid FROM user WHERE rndstr='" . $_POST['user'] . "'";
$result = $conn->query($sql);
if (!$result->num_rows > 0) {
    echo '{"success":false,"message":"当前用户登录状态已过期，请刷新页面重新登录"}';
    $conn->close();
    exit;
} else {
    $row = $result->fetch_array();
    $userid = $row["userid"];
}
$sql = "select * from role where isvalid order by id";
$result = $conn->query($sql);
$roleArray = array();
while ($row = $result->fetch_array()) {
    $roleArray[] = array('rolevalue' => $row['rolevalue'], 'rolecode' => $row['rolecode']);
}
$prompt = urldecode($_POST['message']);
$sql = "select modelvalue from model where id=" . $_POST["model"];
$result = $conn->query($sql);
$row = $result->fetch_array();
$modelvalue = $row["modelvalue"];
$context = json_decode($_POST['context'] ?: "[]") ?: [];
if (($modelvalue == "openai_image") || ($modelvalue == "stablediffusion_image")) {
    $postdata = [
        "prompt" => $prompt,
        "n" => 1,
        "size" => "1024x1024"
    ];
} else if ($modelvalue == "midjourney_image") {
    $url = 'http://' . $_SERVER['HTTP_HOST'] . '/plugins/mj/callback.php';
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
        $url = str_replace('http://', 'https://', $url);
    }
    $postdata = [
        "base64" => "",
        "notifyHook" => $url,
        "prompt" => $prompt,
        "state" => $userid
    ];
} else if ($modelvalue == "ks1api_mj") {
    $url = 'http://' . $_SERVER['HTTP_HOST'] . '/plugins/ks1api_mj/callback.php';
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') {
        $url = str_replace('http://', 'https://', $url);
    }
    $postdata = [
        "base64" => "",
        "notifyHook" => $url,
        "prompt" => $prompt,
        "state" => $userid
    ];
} else {
    $postdata = [
        "model" => $modelvalue,
        "temperature" => 0,
        "stream" => true,
        "messages" => [],
    ];
    if (!empty($_POST["role"])) {
        foreach ($roleArray as $role) {
            if ($_POST["role"] == $role['rolevalue']) {
                eval($role['rolecode']);
            }
        }
    }

    $sql = "select * from main where id=1";
    $result = $conn->query($sql);
    $row = $result->fetch_array();
    if (!empty($row["fakeprompt"])) {
        $fakeprompt = explode("\n", $row["fakeprompt"]);
        $postdata['messages'][] = ['role' => 'user', 'content' => $fakeprompt[0]];
        $postdata['messages'][] = ['role' => 'assistant', 'content' => $fakeprompt[1]];
    }
    if (!empty($context)) {
        $context = array_slice($context, -5);
        foreach ($context as $message) {
            $postdata['messages'][] = ['role' => 'user', 'content' => urldecode($message[0])];
            $postdata['messages'][] = ['role' => 'assistant', 'content' => urldecode($message[1])];
        }
    }
    $postdata['messages'][] = ['role' => 'user', 'content' => $prompt];
}
$postdata = json_encode($postdata);

$postdata = mysqli_real_escape_string($conn, $postdata);
$sql = "UPDATE user SET lastquestion = '" . $_POST['conversationid'] . "," . $postdata . "',lastmodelid=" . $_POST["model"] . " WHERE rndstr='" . $_POST['user'] . "'";
$result = $conn->query($sql);
echo '{"success":true}';
$conn->close();
exit;