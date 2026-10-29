// AI modified: this fictional dataset belongs only to a preview session, never the saved library.
export type CustomerStatus = 'following' | 'active' | 'new'
export interface PreviewCustomer {
  id: number
  name: string
  englishName: string
  contact: string
  englishContact: string
  owner: string
  status: CustomerStatus
  lastContact: string
}
export interface CustomerDraft {
  name: string
  contact: string
  owner: string
  status: CustomerStatus
}
export const customerStatuses: { id: CustomerStatus, title: string }[] = [
  { id: 'following', title: '跟进中' },
  { id: 'active', title: '已合作' },
  { id: 'new', title: '待联系' },
]
export const customerOwners = [
  { id: 'lin', name: '林晓', english: 'Lin Xiao' },
  { id: 'chen', name: '陈越', english: 'Chen Yue' },
  { id: 'zhou', name: '周宁', english: 'Zhou Ning' },
]
export const previewCustomers: PreviewCustomer[] = [
  {
    id: 1,
    name: '远山设计工作室',
    englishName: 'Distant Studio',
    contact: '林晓',
    englishContact: 'Lin Xiao',
    owner: 'lin',
    status: 'following',
    lastContact: '今天',
  },
  {
    id: 2,
    name: '青禾科技',
    englishName: 'Greenfield Tech',
    contact: '陈越',
    englishContact: 'Chen Yue',
    owner: 'chen',
    status: 'active',
    lastContact: '昨天',
  },
  {
    id: 3,
    name: '方寸文化',
    englishName: 'Square Culture',
    contact: '周宁',
    englishContact: 'Zhou Ning',
    owner: 'zhou',
    status: 'new',
    lastContact: '10/26',
  },
  {
    id: 4,
    name: '北岸创意',
    englishName: 'Northbank Creative',
    contact: '许言',
    englishContact: 'Xu Yan',
    owner: 'lin',
    status: 'following',
    lastContact: '10/25',
  },
  {
    id: 5,
    name: '云间数字',
    englishName: 'Cloud Digital',
    contact: '李安',
    englishContact: 'Li An',
    owner: 'chen',
    status: 'active',
    lastContact: '10/24',
  },
  {
    id: 6,
    name: '一木建筑',
    englishName: 'Timber Architecture',
    contact: '王禾',
    englishContact: 'Wang He',
    owner: 'zhou',
    status: 'new',
    lastContact: '10/23',
  },
  {
    id: 7,
    name: '山海品牌',
    englishName: 'Mountain Brand',
    contact: '陈雨',
    englishContact: 'Chen Yu',
    owner: 'lin',
    status: 'following',
    lastContact: '10/22',
  },
  {
    id: 8,
    name: '木白空间',
    englishName: 'Mubai Space',
    contact: '林一',
    englishContact: 'Lin Yi',
    owner: 'chen',
    status: 'active',
    lastContact: '10/21',
  },
  {
    id: 9,
    name: '见山传媒',
    englishName: 'Vista Media',
    contact: '刘青',
    englishContact: 'Liu Qing',
    owner: 'zhou',
    status: 'new',
    lastContact: '10/20',
  },
  {
    id: 10,
    name: '星野产品',
    englishName: 'Stellar Products',
    contact: '吴舟',
    englishContact: 'Wu Zhou',
    owner: 'lin',
    status: 'following',
    lastContact: '10/19',
  },
  {
    id: 11,
    name: '南风咨询',
    englishName: 'Southwind Consulting',
    contact: '赵言',
    englishContact: 'Zhao Yan',
    owner: 'chen',
    status: 'active',
    lastContact: '10/18',
  },
  {
    id: 12,
    name: '石光创作',
    englishName: 'Stone Creative',
    contact: '徐宁',
    englishContact: 'Xu Ning',
    owner: 'zhou',
    status: 'new',
    lastContact: '10/17',
  },
]
