import type en from './en'

export default {
	cancel: '取消',
	confirm: '确认',
	confirmPassword: '确认密码',
	create: '创建',
	createRepository: '创建存储库',
	editRepository: '编辑存储库',
	createRepositoryDescription: '创建一个存储库来存储您的文件',
	email: '邮箱',
	forgotPassword: '忘记密码',
	login: '登录',
	logout: '注销',
	name: '名称',
	password: '密码',
	passwordNotMatch: '密码不匹配',
	path: '路径',
	pleaseLogIn: '请先登录',
	pleaseLogInWithYourUsernameAndPassword: '请使用您的用户名和密码登录',
	rememberMe: '记住我',
	resetPassword: '重置密码',
	settings: '设置',
	signUp: '注册',
	successfullyCreatedRepository: '创建存储库成功',
	successfullyLoggedIn: '登录成功',
	successfullyRegistered: '注册成功!',
	successfullyCreatedUser: '创建用户成功！',
	username: '用户名',
	userManagement: '用户管理', // new add
	avatar: '头像',
	id: 'ID',
	isManager: '管理员权限',
	createTime: '创建时间',
	manageUser: '管理你的用户并编辑他们的账号',
	addUser: '添加用户',
	filter: '筛选',
	filterBy: '筛选条件',
	action: '选项',
	users: '用户',
	edit: '编辑',
	delete: '删除',
	toggleMenu: '切换菜单',
	userShowWords: '展示所有的',
	createUser: '创建用户',
	true: '是',
	false: '否',
	createUserDescription: '创建一个用户来管理你的存储库',
	error: {
		adminAccountExists: '管理员账户已存在',
		invalidUsernameOrPassword: '用户名或密码错误',
		loginFailed: '登录失败',
		pathIsNotDirectory: '路径不是目录',
		pathNotExists: '路径不存在',
		permissionDenied: '权限不足',
		registerFailed: '注册失败',
		repositoryAlreadyExists: '存储库已存在',
		repositoryNotExists: '存储库不存在',
		usernameHasBeenRegistered: '该用户名已被注册',
		createUserFailed: '创建用户失败',
		deleteUserFailed: '删除用户失败',
	},
} satisfies typeof en
