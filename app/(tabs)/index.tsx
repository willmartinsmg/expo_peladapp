import { useAuth } from '@/contexts/auth-context'
import { api } from '@/services/api'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import CardTop3Artilheiros from '@/components/dashboard/CardTop3Artilheiros'
import CardTop3Assistencias from '@/components/dashboard/CardTop3Assistencias'
import CardTop3Melhores from '@/components/dashboard/CardTop3Melhores'

interface RecentPlayerSummary {
  userId: number
  userName: string
  totalGoals: number
  totalAssists: number
  matchdayCount: number
}

interface PlayerPerformance {
  userId: number
  userName: string
  wins: number
  draws: number
  losses: number
  goals: number
  assists: number
  matches: number
}

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()

  // Mock temporário até criar os contextos
  const groups: any[] = []
  const currentGroup = null
  const groupsLoading = false
  const groupId = null

  const [loading, setLoading] = useState(false)
  const [matchday, setMatchday] = useState<any | null>(null)
  const [isGroupAdmin, setIsGroupAdmin] = useState(false)
  const [hasTeams, setHasTeams] = useState(false)
  const [topScorers, setTopScorers] = useState<RecentPlayerSummary[]>([])
  const [topAssists, setTopAssists] = useState<RecentPlayerSummary[]>([])
  const [loadingRecentStats, setLoadingRecentStats] = useState(true)
  const [recentStatsError, setRecentStatsError] = useState<string | null>(null)
  const [recentStatsPeriod, setRecentStatsPeriod] = useState<{
    start: string
    end: string
  } | null>(null)
  const [matchdaysEvaluated, setMatchdaysEvaluated] = useState(0)
  const [topPerformers, setTopPerformers] = useState<PlayerPerformance[]>([])
  const [loadingTopPerformers, setLoadingTopPerformers] = useState(true)
  const [topPerformersError, setTopPerformersError] = useState<string | null>(null)
  const [matchesEvaluatedForPerformers, setMatchesEvaluatedForPerformers] = useState(0)

  // Estados para filtro de competência
  const [allMatchdays, setAllMatchdays] = useState<any[]>([])
  const [selectedMatchdayFilter, setSelectedMatchdayFilter] = useState<string>('specific')
  const [selectedMonthYear, setSelectedMonthYear] = useState<string | null>(null)
  const [availableMonths, setAvailableMonths] = useState<{ key: string; label: string }[]>([])
  const [hasInitializedFilter, setHasInitializedFilter] = useState(false)

  // Estados para loading
  const [loadingAdmin, setLoadingAdmin] = useState(true)
  const [loadingMatchday, setLoadingMatchday] = useState(true)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const isLoading = loadingAdmin || loadingMatchday || loadingTeams || groupsLoading

  // Buscar todos os matchdays para o filtro e agrupar por mês/ano
  useEffect(() => {
    const fetchAllMatchdays = async () => {
      if (!groupId) {
        setAllMatchdays([])
        setAvailableMonths([])
        return
      }

      try {
        const response = await api.get(`/matchday/get-all-matchdays/${groupId}`)
        const matchdays = Array.isArray(response.data) ? response.data : []
        const sortedMatchdays = matchdays.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setAllMatchdays(sortedMatchdays)

        // Agrupar matchdays por mês/ano
        const monthsMap = new Map<string, { key: string; label: string }>()

        sortedMatchdays.forEach((matchday) => {
          const dateStr = matchday.date.replace('Z', '')
          const date = new Date(dateStr)
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

          if (!monthsMap.has(monthYear)) {
            const label = date.toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
            monthsMap.set(monthYear, { key: monthYear, label: capitalizedLabel })
          }
        })

        const months = Array.from(monthsMap.values())
        setAvailableMonths(months)

        if (!hasInitializedFilter && months.length > 0) {
          const now = new Date()
          const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
          const currentMonthExists = months.some((m) => m.key === currentMonthYear)

          if (currentMonthExists) {
            setSelectedMonthYear(currentMonthYear)
          } else if (months[0]) {
            setSelectedMonthYear(months[0].key)
          }

          setHasInitializedFilter(true)
        }
      } catch (err) {
        console.error('Erro ao buscar matchdays:', err)
        setAllMatchdays([])
        setAvailableMonths([])
      }
    }

    fetchAllMatchdays()
  }, [groupId, hasInitializedFilter])

  // Verificar se usuário é admin do grupo atual
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!groupId || !user) {
        setIsGroupAdmin(false)
        setLoadingAdmin(false)
        return
      }

      try {
        const res = await api.get('/organization/admin')
        const adminGroups = res.data || []
        const isAdmin = adminGroups.some((group: any) => group.id === groupId)
        setIsGroupAdmin(isAdmin)
      } catch (err) {
        console.error('Erro ao verificar status admin:', err)
        setIsGroupAdmin(false)
      } finally {
        setLoadingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [groupId, user])

  // Buscar próximo jogo
  useEffect(() => {
    const fetchNext = async () => {
      if (!groupId) {
        setLoadingMatchday(false)
        return
      }
      setLoading(true)
      try {
        const res = await api.get(`/matchday/get-next-matchdays/${groupId}`)
        const next = res.data || null
        setMatchday(next)
      } catch (err) {
        setMatchday(null)
      } finally {
        setLoading(false)
        setLoadingMatchday(false)
      }
    }

    fetchNext()
  }, [groupId])

  // Verificar se há times salvos
  useEffect(() => {
    const checkTeams = async () => {
      if (!matchday?.id) {
        setLoadingTeams(false)
        return
      }

      try {
        const res = await api.get(`/teams/${matchday.id}`)
        const teams = res.data || []
        setHasTeams(teams.length > 0)
      } catch (err) {
        setHasTeams(false)
      } finally {
        setLoadingTeams(false)
      }
    }

    checkTeams()
  }, [matchday?.id])

  // Buscar artilheiro das últimas 5 semanas ou matchday específico
  useEffect(() => {
    let isMounted = true

    const fetchRecentStats = async () => {
      const now = new Date()
      const fourWeeksAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)

      if (isMounted) {
        setRecentStatsPeriod({
          start: fourWeeksAgo.toISOString(),
          end: now.toISOString(),
        })
      }

      if (!groupId) {
        if (isMounted) {
          setTopScorers([])
          setTopAssists([])
          setLoadingRecentStats(false)
          setRecentStatsError(null)
          setMatchdaysEvaluated(0)
        }
        return
      }

      if (isMounted) {
        setLoadingRecentStats(true)
        setRecentStatsError(null)
      }

      try {
        const response = await api.get(`/matchday/get-all-matchdays/${groupId}`)
        const matchdays = Array.isArray(response.data) ? response.data : []

        let recentMatchdays: any[]

        if (selectedMatchdayFilter === 'specific' && selectedMonthYear) {
          recentMatchdays = matchdays.filter((day: any) => {
            if (!day?.date) return false
            const dateStr = day.date.replace('Z', '')
            const date = new Date(dateStr)
            const matchMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            return matchMonthYear === selectedMonthYear
          })
        } else {
          recentMatchdays = matchdays.filter((day: any) => {
            if (!day?.date) return false
            const matchDate = new Date(day.date)
            return matchDate >= fourWeeksAgo && matchDate <= now
          })
        }

        if (isMounted) {
          setMatchdaysEvaluated(recentMatchdays.length)
        }

        if (recentMatchdays.length === 0) {
          if (isMounted) {
            setTopScorers([])
            setTopAssists([])
            setLoadingRecentStats(false)
          }
          return
        }

        const statsResponses = await Promise.all(
          recentMatchdays.map(async (day: any) => {
            try {
              const statsRes = await api.get(`/player-stats/matchday/${day.id}`)

              return {
                matchdayId: day.id,
                stats: Array.isArray(statsRes.data) ? statsRes.data : [],
              }
            } catch (error) {
              console.error('Erro ao buscar estatísticas do matchday', day.id, error)
              return { matchdayId: day.id, stats: [] }
            }
          })
        )

        const playersMap = new Map<
          number,
          {
            userId: number
            userName: string
            totalGoals: number
            totalAssists: number
            matchdayIds: Set<number>
          }
        >()

        statsResponses.forEach(({ matchdayId, stats }) => {
          stats.forEach((player: any) => {
            if (!player?.userId) return

            const goals = Number(player.goals || 0)
            const assists = Number(player.assists || 0)

            if (!playersMap.has(player.userId)) {
              playersMap.set(player.userId, {
                userId: player.userId,
                userName: player.userName || 'Jogador',
                totalGoals: 0,
                totalAssists: 0,
                matchdayIds: new Set<number>(),
              })
            }

            const entry = playersMap.get(player.userId)!
            entry.totalGoals += goals
            entry.totalAssists += assists
            entry.matchdayIds.add(matchdayId)
          })
        })

        const aggregatedPlayers = Array.from(playersMap.values()).map((player) => ({
          userId: player.userId,
          userName: player.userName,
          totalGoals: player.totalGoals,
          totalAssists: player.totalAssists,
          matchdayCount: player.matchdayIds.size,
        }))

        const goalLeaders = aggregatedPlayers
          .filter((player) => player.totalGoals > 0)
          .sort((a, b) => {
            if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals
            if (b.totalAssists !== a.totalAssists) return b.totalAssists - a.totalAssists
            return a.userName.localeCompare(b.userName)
          })

        const assistLeaders = aggregatedPlayers
          .filter((player) => player.totalAssists > 0)
          .sort((a, b) => {
            if (b.totalAssists !== a.totalAssists) return b.totalAssists - a.totalAssists
            if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals
            return a.userName.localeCompare(b.userName)
          })

        if (isMounted) {
          setTopScorers(goalLeaders.slice(0, 3))
          setTopAssists(assistLeaders.slice(0, 3))
          setLoadingRecentStats(false)
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas recentes:', error)
        if (isMounted) {
          setRecentStatsError('Não foi possível carregar as estatísticas recentes.')
          setTopScorers([])
          setTopAssists([])
          setMatchdaysEvaluated(0)
          setLoadingRecentStats(false)
        }
      }
    }

    fetchRecentStats()

    return () => {
      isMounted = false
    }
  }, [groupId, selectedMatchdayFilter, selectedMonthYear])

  // Buscar top performers (implementação completa igual ao código original)
  useEffect(() => {
    let isMounted = true

    const fetchTopPerformers = async () => {
      const now = new Date()
      const fourWeeksAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)

      if (!groupId) {
        if (isMounted) {
          setTopPerformers([])
          setTopPerformersError(null)
          setMatchesEvaluatedForPerformers(0)
          setLoadingTopPerformers(false)
        }
        return
      }

      if (isMounted) {
        setLoadingTopPerformers(true)
        setTopPerformersError(null)
        setMatchesEvaluatedForPerformers(0)
      }

      try {
        const matchdaysRes = await api.get(`/matchday/get-all-matchdays/${groupId}`)
        const matchdays = Array.isArray(matchdaysRes.data) ? matchdaysRes.data : []

        let recentMatchdays: any[]

        if (selectedMatchdayFilter === 'specific' && selectedMonthYear) {
          recentMatchdays = matchdays.filter((day: any) => {
            if (!day?.date) return false
            const dateStr = day.date.replace('Z', '')
            const date = new Date(dateStr)
            const matchMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            return matchMonthYear === selectedMonthYear
          })
        } else {
          recentMatchdays = matchdays.filter((day: any) => {
            if (!day?.date) return false
            const matchDate = new Date(day.date)
            return matchDate >= fourWeeksAgo && matchDate <= now
          })
        }

        const collectedMatches: any[] = []

        const sortedMatchdays = [...recentMatchdays].sort((a: any, b: any) => {
          const timeA = new Date(a?.date ?? 0).getTime()
          const timeB = new Date(b?.date ?? 0).getTime()
          return timeB - timeA
        })

        for (const day of sortedMatchdays) {
          try {
            const matchesRes = await api.get(`/matches/matchday/${day.id}`)
            const matchesData = Array.isArray(matchesRes.data) ? matchesRes.data : []

            const finishedMatches = matchesData.filter((match: any) => {
              if (!match) return false
              if (match?.endTime) return true
              const hasScores =
                match?.scoreTeam1 !== undefined &&
                match?.scoreTeam1 !== null &&
                match?.scoreTeam2 !== undefined &&
                match?.scoreTeam2 !== null
              return hasScores
            })

            finishedMatches.forEach((match: any) => {
              collectedMatches.push({ ...match, _matchdayDate: day.date })
            })
          } catch (error) {
            console.error('Erro ao buscar partidas para matchday', day?.id, error)
          }
        }

        const matchesInPeriod = collectedMatches.filter((match) => {
          const referenceDate = match?._matchdayDate || match?.matchday?.date
          if (referenceDate) {
            const date = new Date(referenceDate)
            return date >= fourWeeksAgo && date <= now
          }
          const created = match?.createdAt ? new Date(match.createdAt) : null
          if (created) return created >= fourWeeksAgo && created <= now
          return true
        })

        if (isMounted) {
          setMatchesEvaluatedForPerformers(matchesInPeriod.length)
        }

        if (matchesInPeriod.length === 0) {
          if (isMounted) {
            setTopPerformers([])
          }
          return
        }

        const playerStats = new Map<number, PlayerPerformance>()

        for (const match of matchesInPeriod) {
          const matchId = match?.id
          if (!matchId) continue

          try {
            const [participationsRes, goalsRes] = await Promise.all([
              api.get(`/player-participation/match/${matchId}`),
              api.get(`/goals/match/${matchId}`),
            ])

            const participations = Array.isArray(participationsRes.data)
              ? participationsRes.data
              : []
            const goals = Array.isArray(goalsRes.data) ? goalsRes.data : []

            if (participations.length === 0) continue

            const team1Score = Number(match?.scoreTeam1 ?? 0)
            const team2Score = Number(match?.scoreTeam2 ?? 0)
            const team1Number = match?.team1
            const team2Number = match?.team2

            const teamResults = new Map<number, 'win' | 'draw' | 'loss'>()

            if (team1Number !== undefined && team1Number !== null) {
              if (team1Score > team2Score) {
                teamResults.set(team1Number, 'win')
              } else if (team1Score < team2Score) {
                teamResults.set(team1Number, 'loss')
              } else {
                teamResults.set(team1Number, 'draw')
              }
            }

            if (team2Number !== undefined && team2Number !== null) {
              if (team2Score > team1Score) {
                teamResults.set(team2Number, 'win')
              } else if (team2Score < team1Score) {
                teamResults.set(team2Number, 'loss')
              } else {
                teamResults.set(team2Number, 'draw')
              }
            }

            const participationById = new Map<
              number,
              { userId: number; userName: string; teamNumber?: number }
            >()

            participations.forEach((participation: any) => {
              const userId = participation?.user?.id ?? participation?.userId ?? null
              const userName =
                participation?.user?.name || participation?.userName || 'Jogador'
              const teamNumber = participation?.team?.team
              const participationId = participation?.id

              if (!userId || !participationId) return

              participationById.set(participationId, {
                userId,
                userName,
                teamNumber,
              })

              if (!playerStats.has(userId)) {
                playerStats.set(userId, {
                  userId,
                  userName,
                  wins: 0,
                  draws: 0,
                  losses: 0,
                  goals: 0,
                  assists: 0,
                  matches: 0,
                })
              }
            })

            participationById.forEach(({ userId, teamNumber }) => {
              const stats = playerStats.get(userId)
              if (!stats) return

              stats.matches += 1
              const outcome =
                (teamNumber !== undefined && teamResults.get(teamNumber)) || 'draw'

              if (outcome === 'win') {
                stats.wins += 1
              } else if (outcome === 'loss') {
                stats.losses += 1
              } else {
                stats.draws += 1
              }
            })

            goals.forEach((goal: any) => {
              if (!goal) return
              const scorerParticipationId = goal?.scorerParticipationId
              const assistParticipationId = goal?.assistParticipationId
              const isOwnGoal = Boolean(goal?.isOwnGoal)

              const scorerInfo = scorerParticipationId
                ? participationById.get(scorerParticipationId)
                : undefined

              if (scorerInfo && !isOwnGoal) {
                const stats = playerStats.get(scorerInfo.userId)
                if (stats) {
                  stats.goals += 1
                }
              }

              const assistInfo = assistParticipationId
                ? participationById.get(assistParticipationId)
                : undefined

              if (assistInfo) {
                const stats = playerStats.get(assistInfo.userId)
                if (stats) {
                  stats.assists += 1
                }
              }
            })
          } catch (error) {
            console.error('Erro ao processar dados do jogo para ranking:', error)
          }
        }

        const performers = Array.from(playerStats.values()).filter(
          (player) => player.matches > 0
        )

        performers.sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins
          if (b.draws !== a.draws) return b.draws - a.draws
          if (a.losses !== b.losses) return a.losses - b.losses
          if (b.goals !== a.goals) return b.goals - a.goals
          if (b.assists !== a.assists) return b.assists - a.assists
          return a.userName.localeCompare(b.userName)
        })

        if (isMounted) {
          setTopPerformers(performers.slice(0, 3))
        }
      } catch (error) {
        console.error('Erro ao buscar melhores jogadores:', error)
        if (isMounted) {
          setTopPerformersError('Não foi possível carregar os melhores jogadores.')
          setTopPerformers([])
        }
      } finally {
        if (isMounted) {
          setLoadingTopPerformers(false)
        }
      }
    }

    fetchTopPerformers()

    return () => {
      isMounted = false
    }
  }, [groupId, selectedMatchdayFilter, selectedMonthYear])

  async function gerarConvite() {
    try {
      const res = await api.post('/organization/invite', {
        email: user?.email,
        organizationId: groupId,
      })
      const url = `${process.env.EXPO_PUBLIC_URL_SITE || 'http://localhost:3001'}/invite/${res.data.token}`

      try {
        const result = await Share.share({
          message: `Vem pra pelada! ${url}`,
          title: 'Convite Peladapp',
        })

        if (result.action === Share.sharedAction) {
          Alert.alert('Sucesso', 'Convite compartilhado com sucesso!')
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível compartilhar o convite.')
      }
    } catch (err) {
      console.error('Erro ao gerar convite:', err)
      Alert.alert('Erro', 'Não foi possível gerar o convite. Tente novamente.')
    }
  }

  const formatPeriodDate = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const periodLabel = (() => {
    if (selectedMatchdayFilter === 'specific' && selectedMonthYear) {
      const monthData = availableMonths.find((m) => m.key === selectedMonthYear)
      if (monthData) {
        return monthData.label
      }
    }

    return recentStatsPeriod
      ? `${formatPeriodDate(recentStatsPeriod.start)} - ${formatPeriodDate(
          recentStatsPeriod.end
        )}`
      : null
  })()

  const cardTitles = (() => {
    if (selectedMatchdayFilter === 'specific' && selectedMonthYear) {
      const monthData = availableMonths.find((m) => m.key === selectedMonthYear)
      if (monthData) {
        const monthYearText = monthData.label
        return {
          artilheiros: `Top 3 artilheiros de ${monthYearText}`,
          assistencias: `Top 3 assistentes de ${monthYearText}`,
          melhores: `Top 3 jogadores de ${monthYearText}`,
        }
      }
    }

    return {
      artilheiros: undefined,
      assistencias: undefined,
      melhores: undefined,
    }
  })()

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando informações...</Text>
      </View>
    )
  }

  if (groups.length === 0 && !groupsLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContainer}>
        <View style={styles.onboardingCard}>
          <Ionicons name="people" size={64} color="#60a5fa" style={styles.onboardingIcon} />
          <Text style={styles.onboardingTitle}>Bem-vindo ao Peladapp!</Text>
          <Text style={styles.onboardingSubtitle}>
            Para começar a usar o app, você precisa estar em um grupo.
          </Text>

          <View style={styles.onboardingSection}>
            <View style={styles.onboardingSectionHeader}>
              <Ionicons name="add-circle" size={24} color="#34d399" />
              <Text style={styles.onboardingSectionTitle}>Criar seu próprio grupo</Text>
            </View>
            <Text style={styles.onboardingSectionText}>
              Crie um grupo novo e convide seus amigos para jogar juntos.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonGreen]}
              onPress={() => router.push('/admin/grupos')}
            >
              <Text style={styles.buttonText}>Criar Grupo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>ou</Text>

          <View style={styles.onboardingSection}>
            <View style={styles.onboardingSectionHeader}>
              <Ionicons name="people" size={24} color="#60a5fa" />
              <Text style={styles.onboardingSectionTitle}>Entrar em um grupo existente</Text>
            </View>
            <Text style={styles.onboardingSectionText}>
              Peça para o administrador de um grupo te enviar um convite.
            </Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                💡 <Text style={styles.tipTextBold}>Dica:</Text> O convite chegará como um link
                que você pode clicar para entrar no grupo.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Card azul: Próximo Jogo */}
        <View style={styles.nextGameCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={24} color="#bfdbfe" />
            </View>
            <Text style={styles.nextGameTitle}>
              {(() => {
                if (!matchday) return 'Próximo Jogo'
                const now = new Date()
                const gameDate = new Date(matchday.date)
                const isPastGame = gameDate < now
                const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
                const isWithin48Hours = gameDate >= fortyEightHoursAgo

                if (isPastGame && isWithin48Hours) {
                  return 'Último Jogo'
                }
                return 'Próximo Jogo'
              })()}
            </Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#bfdbfe" />
              <Text style={styles.loadingSubtext}>Carregando informações do jogo...</Text>
            </View>
          )}

          {!loading && !matchday && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum jogo disponível no momento.</Text>
            </View>
          )}

          {!loading && matchday && (
            <View style={styles.matchdayInfo}>
              {(() => {
                const now = new Date()
                const gameDate = new Date(matchday.date)
                const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
                const isPastGame = gameDate < now
                const isWithin48Hours = gameDate >= fortyEightHoursAgo

                if (isPastGame && isWithin48Hours) {
                  return (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>
                        ⏰ Jogo finalizado - Disponível por mais{' '}
                        {Math.ceil(
                          (gameDate.getTime() + 48 * 60 * 60 * 1000 - now.getTime()) /
                            (60 * 60 * 1000)
                        )}
                        h
                      </Text>
                    </View>
                  )
                }
                return null
              })()}

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>📅 Data e Horário</Text>
                <Text style={styles.infoValue}>
                  {(() => {
                    const dateStr = matchday.date.replace('Z', '')
                    const localDate = new Date(dateStr)
                    return localDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })
                  })()}{' '}
                  às{' '}
                  {(() => {
                    const dateStr = matchday.date.replace('Z', '')
                    const localDate = new Date(dateStr)
                    return localDate.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  })()}
                </Text>
              </View>

              {matchday.location && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>📍 Local</Text>
                  <Text style={styles.infoValue}>{matchday.location}</Text>
                </View>
              )}
            </View>
          )}

          {matchday && user && (
            <View style={styles.actionsContainer}>
              {!hasTeams && (
                <View>
                  {/* TODO: Adicionar CardConfirmacao quando estiver disponível */}

                  <TouchableOpacity
                    style={[styles.button, styles.buttonOrange]}
                    onPress={() => router.push(`/lista-presenca/${matchday.id}`)}
                  >
                    <Text style={styles.buttonText}>📋 Visualizar Lista</Text>
                  </TouchableOpacity>
                </View>
              )}

              {hasTeams && (
                <View>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonGreen, styles.mt2]}
                    onPress={() => router.push(`/times/${matchday.id}`)}
                  >
                    <Text style={styles.buttonText}>⚽ Times</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonBlue, styles.mt2]}
                    onPress={() => router.push(`/jogo/dashboard/${matchday.id}`)}
                  >
                    <Ionicons name="stats-chart" size={16} color="#fff" />
                    <Text style={styles.buttonText}> Placar</Text>
                  </TouchableOpacity>

                  {isGroupAdmin && (
                    <TouchableOpacity
                      style={[styles.button, styles.buttonPurple, styles.mt2]}
                      onPress={() => router.push(`/jogo/painel/${matchday.id}`)}
                    >
                      <Ionicons name="settings" size={16} color="#fff" />
                      <Text style={styles.buttonText}> Administração do Placar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        <CardTop3Artilheiros
          players={topScorers}
          loading={loadingRecentStats}
          error={recentStatsError}
          periodLabel={periodLabel}
          matchdaysEvaluated={matchdaysEvaluated}
          onSeeMore={() => {
            const params = new URLSearchParams()
            params.set('filter', selectedMatchdayFilter)
            if (selectedMonthYear) params.set('monthYear', selectedMonthYear)
            router.push(`/dashboard/relatorio-gols?${params.toString()}`)
          }}
          customTitle={cardTitles.artilheiros}
        />

        <CardTop3Assistencias
          players={topAssists}
          loading={loadingRecentStats}
          error={recentStatsError}
          periodLabel={periodLabel}
          matchdaysEvaluated={matchdaysEvaluated}
          onSeeMore={() => {
            const params = new URLSearchParams()
            params.set('filter', selectedMatchdayFilter)
            if (selectedMonthYear) params.set('monthYear', selectedMonthYear)
            router.push(`/dashboard/relatorio-assistencias?${params.toString()}`)
          }}
          customTitle={cardTitles.assistencias}
        />

        <CardTop3Melhores
          players={topPerformers}
          loading={loadingTopPerformers}
          error={topPerformersError}
          matchesEvaluated={matchesEvaluatedForPerformers}
          periodLabel={periodLabel}
          onSeeMore={() => {
            const params = new URLSearchParams()
            params.set('filter', selectedMatchdayFilter)
            if (selectedMonthYear) params.set('monthYear', selectedMonthYear)
            router.push(`/dashboard/relatorio-melhores?${params.toString()}`)
          }}
          customTitle={cardTitles.melhores}
        />

        {matchday && (
          <View style={styles.historyCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconContainerPurple}>
                  <Ionicons name="calendar" size={24} color="#a78bfa" />
                </View>
                <View>
                  <Text style={styles.historyTitle}>Histórico de Peladas</Text>
                  <Text style={styles.historySubtitle}>
                    Visualize todas as peladas e suas estatísticas
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => router.push('/historico-jogos')}
              >
                <Text style={styles.smallButtonText}>Ver histórico completo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isGroupAdmin && (
          <TouchableOpacity style={styles.inviteButton} onPress={gerarConvite}>
            <Text style={styles.inviteButtonText}>🎉 Convidar galera pra pelada</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  onboardingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  onboardingIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  onboardingSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  onboardingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  onboardingSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  onboardingSectionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonGreen: {
    backgroundColor: '#059669',
  },
  buttonOrange: {
    backgroundColor: '#f97316',
  },
  buttonBlue: {
    backgroundColor: '#2563eb',
  },
  buttonPurple: {
    backgroundColor: '#9333ea',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
  },
  tipTextBold: {
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginVertical: 8,
  },
  nextGameCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainerPurple: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  nextGameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#bfdbfe',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#bfdbfe',
  },
  matchdayInfo: {
    marginBottom: 24,
    gap: 16,
  },
  warningBox: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  warningText: {
    color: '#fed7aa',
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#bfdbfe',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionsContainer: {
    gap: 12,
  },
  mt2: {
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'column',
    gap: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  historySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  smallButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inviteButton: {
    backgroundColor: '#facc15',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
})
