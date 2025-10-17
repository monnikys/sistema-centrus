import React from 'react'
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Avatar,
  Stack,
  LinearProgress,
  alpha,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  FolderOpen as FolderOpenIcon,
  BusinessCenter as BusinessIcon,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

// Componente de Card de Widget - Estilo EXATO do Minimal Free
const WidgetSummary = ({ title, total, icon, color, sx, ...other }) => {
  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: color,
        bgcolor: alpha(color, 0.08),
        ...sx,
      }}
      {...other}
    >
      <Avatar
        sx={{
          mx: 'auto',
          width: 64,
          height: 64,
          mb: 3,
          color: color,
          bgcolor: alpha(color, 0.16),
        }}
      >
        {icon}
      </Avatar>

      <Typography variant="h3" sx={{ fontWeight: 700 }}>
        {total}
      </Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72, mt: 1 }}>
        {title}
      </Typography>
    </Card>
  )
}

// Componente Principal do Dashboard
const DashboardMUI = () => {
  // Buscar dados REAIS do banco Dexie
  const funcionarios = useLiveQuery(() => db.funcionarios.toArray()) || []
  const documentos = useLiveQuery(() => db.documentos.toArray()) || []

  // Calcular métricas reais
  const totalFuncionarios = funcionarios.length
  const totalDocumentos = documentos.length

  // Documentos por categoria
  const documentosPorCategoria = documentos.reduce((acc, doc) => {
    acc[doc.categoria] = (acc[doc.categoria] || 0) + 1
    return acc
  }, {})

  // Funcionários por departamento
  const funcionariosPorDepartamento = funcionarios.reduce((acc, func) => {
    acc[func.departamento] = (acc[func.departamento] || 0) + 1
    return acc
  }, {})

  // Dados para gráfico de pizza - estilo Minimal
  const pieColors = ['#00AB55', '#0041D0', '#FF5722', '#FFC107']
  const pieData = Object.entries(documentosPorCategoria)
    .map(([categoria, count], index) => ({
      name: categoria,
      value: count,
      color: pieColors[index % pieColors.length],
    }))
    .slice(0, 4)

  // Dados para gráfico de barras - estilo Minimal
  const barColors = ['#0041D0', '#00AB55', '#FFC107', '#FF5722']
  const barData = Object.entries(funcionariosPorDepartamento)
    .map(([dept, count], index) => ({
      name: dept.substring(0, 8),
      value: count,
      color: barColors[index % barColors.length],
    }))
    .slice(0, 6)

  // Dados para lista de tarefas/categorias
  const categoryList = Object.entries(documentosPorCategoria)
    .sort(([, a], [, b]) => b - a)
    .map(([categoria, count], index) => {
      const percentage =
        totalDocumentos > 0 ? (count / totalDocumentos) * 100 : 0
      return {
        name: categoria,
        count: count,
        percentage: percentage,
        color: pieColors[index % pieColors.length],
      }
    })

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: 'background.default',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header - Estilo Minimal */}
        <Typography variant="h4" sx={{ mb: 5, fontWeight: 700 }}>
          Olá, Bem-vindo de volta 👋
        </Typography>

        {/* Cards de Widgets - Layout EXATO do Minimal Free */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Total Funcionários"
              total={totalFuncionarios}
              color="#00AB55"
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Total Documentos"
              total={totalDocumentos}
              color="#0041D0"
              icon={<DescriptionIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Categorias"
              total={Object.keys(documentosPorCategoria).length}
              color="#FF5722"
              icon={<FolderOpenIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Departamentos"
              total={Object.keys(funcionariosPorDepartamento).length}
              color="#7635DC"
              icon={<BusinessIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>

        {/* Gráficos - Layout EXATO do Minimal Free */}
        <Grid container spacing={3}>
          {/* Gráfico de Barras */}
          <Grid item xs={12} md={6} lg={8}>
            <Card sx={{ boxShadow: 0 }}>
              <Box sx={{ p: 3, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Funcionários por Departamento
                </Typography>
              </Box>

              <Box sx={{ p: 3, pt: 0 }}>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={barData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#637381', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#637381', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0px 8px 16px rgba(145, 158, 171, 0.16)',
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Gráfico de Pizza */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ boxShadow: 0 }}>
              <Box sx={{ p: 3, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Documentos por Categoria
                </Typography>
              </Box>

              <Box sx={{ p: 3, pt: 0 }}>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ value }) => value}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <Stack spacing={2} sx={{ mt: 3 }}>
                      {pieData.map((item, index) => (
                        <Stack
                          key={index}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                bgcolor: item.color,
                                borderRadius: '50%',
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              {item.name}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum documento cadastrado
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Lista de Categorias com Progress */}
          {categoryList.length > 0 && (
            <Grid item xs={12} md={6} lg={8}>
              <Card sx={{ boxShadow: 0 }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Resumo de Categorias
                  </Typography>

                  <Stack spacing={3}>
                    {categoryList.map((item, index) => (
                      <Box key={index}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                          >
                            {item.count} ({item.percentage.toFixed(0)}%)
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(item.color, 0.12),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: item.color,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Grid>
          )}

          {/* Card de Informação Extra */}
          <Grid item xs={12} md={6} lg={4}>
            <Card
              sx={{
                boxShadow: 0,
                bgcolor: alpha('#00AB55', 0.08),
                color: '#00AB55',
              }}
            >
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {totalFuncionarios + totalDocumentos}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                  Total de Registros no Sistema
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardMUI
