import dayjs from 'dayjs'

export function getProgress(item) {
    return Math.min(Math.round((item.collected_amount / item.target_amount) * 100), 100)
}

export function getDaysLeft(deadline) {
    const days = dayjs(deadline).diff(dayjs(), 'day')
    return days > 0 ? `${days} hari lagi` : 'Berakhir'
}

export function formatDeadline(deadline) {
    return dayjs(deadline).format('DD MMMM YYYY')
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}