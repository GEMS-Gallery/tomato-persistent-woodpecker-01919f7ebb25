import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, Card, CardContent, Box, Snackbar, IconButton, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Person {
  id: bigint;
  name: string;
  percentage: number;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
}

function App() {
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { control, handleSubmit } = useForm();

  const fetchBillDetails = useCallback(async () => {
    try {
      const details = await backend.getBillDetails();
      setBillAmount(details.billAmount[0] ? Number(details.billAmount[0]) : null);
      setPeople(details.people.map(p => ({ ...p, id: p.id, percentage: Number(p.percentage) })));
      setTotalPercentage(Number(details.totalPercentage));
    } catch (error) {
      console.error("Error fetching bill details:", error);
    }
  }, []);

  useEffect(() => {
    fetchBillDetails();
  }, [fetchBillDetails]);

  const onSubmitBillAmount = async (data: { billAmount: string }) => {
    const amount = parseFloat(data.billAmount);
    if (isNaN(amount)) {
      console.error("Invalid bill amount");
      return;
    }
    try {
      await backend.setBillAmount(amount);
      setBillAmount(amount);
      setSnackbarMessage(`Bill amount set to $${amount.toFixed(2)}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error setting bill amount:", error);
    }
  };

  const addPerson = async () => {
    try {
      const id = await backend.addPerson('');
      setPeople(prevPeople => [...prevPeople, { id, name: '', percentage: 0 }]);
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };

  const updatePersonName = (id: bigint, name: string) => {
    setPeople(prevPeople =>
      prevPeople.map(p => p.id === id ? { ...p, name } : p)
    );
  };

  const updatePersonPercentage = (id: bigint, percentage: number) => {
    setPeople(prevPeople => {
      const updatedPeople = prevPeople.map(p =>
        p.id === id ? { ...p, percentage } : p
      );
      const newTotalPercentage = updatedPeople.reduce((sum, p) => sum + p.percentage, 0);
      setTotalPercentage(newTotalPercentage);
      return updatedPeople;
    });
  };

  const debouncedUpdateBackend = useMemo(
    () => debounce(async (updates: [bigint, string, number][]) => {
      try {
        await backend.batchUpdatePeople(updates);
      } catch (error) {
        console.error("Error updating people:", error);
      }
    }, 500),
    []
  );

  useEffect(() => {
    const updates = people.map(p => [p.id, p.name, p.percentage] as [bigint, string, number]);
    debouncedUpdateBackend(updates);
  }, [people, debouncedUpdateBackend]);

  const removePerson = async (id: bigint) => {
    try {
      await backend.removePerson(id);
      setPeople(prevPeople => prevPeople.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error removing person:", error);
    }
  };

  const pieChartData = {
    labels: people.map(p => p.name || `Person ${p.id}`),
    datasets: [
      {
        data: people.map(p => p.percentage),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Bill Splitting App
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {people.length > 0 ? (
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Typography>Add people to see the distribution</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <form onSubmit={handleSubmit(onSubmitBillAmount)}>
            <Controller
              name="billAmount"
              control={control}
              defaultValue={billAmount?.toString() || ''}
              rules={{ required: 'Bill amount is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Total Bill Amount"
                  type="number"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
            <Button type="submit" variant="contained" color="primary">
              Set Bill Amount
            </Button>
          </form>
          {people.map((person) => (
            <Card key={person.id.toString()} sx={{ mt: 2 }}>
              <CardContent>
                <TextField
                  label="Name"
                  value={person.name}
                  onChange={(e) => updatePersonName(person.id, e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Typography id={`input-slider-${person.id}`} gutterBottom>
                  Percentage: {person.percentage}%
                </Typography>
                <Slider
                  value={person.percentage}
                  onChange={(_, newValue) => updatePersonPercentage(person.id, newValue as number)}
                  aria-labelledby={`input-slider-${person.id}`}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={100}
                />
                <Typography variant="body2">
                  Amount: ${billAmount ? ((billAmount * person.percentage) / 100).toFixed(2) : '0.00'}
                </Typography>
                <IconButton onClick={() => removePerson(person.id)} color="secondary">
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          ))}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={addPerson} variant="contained" color="primary">
              Add Person
            </Button>
            <Typography variant="h6" color={totalPercentage === 100 ? 'primary' : 'error'}>
              Total: {totalPercentage}%
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default App;
