import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, TextField, Button, Slider, Card, CardContent, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface Person {
  id: bigint;
  name: string;
  percentage: number;
}

function App() {
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const { control, handleSubmit } = useForm();

  useEffect(() => {
    fetchBillDetails();
  }, []);

  const fetchBillDetails = async () => {
    try {
      const details = await backend.getBillDetails();
      setBillAmount(details.billAmount[0] ? Number(details.billAmount[0]) : null);
      setPeople(details.people.map(p => ({ ...p, id: p.id, percentage: Number(p.percentage) })));
      setTotalPercentage(Number(details.totalPercentage));
    } catch (error) {
      console.error("Error fetching bill details:", error);
    }
  };

  const onSubmitBillAmount = async (data: { billAmount: string }) => {
    const amount = parseFloat(data.billAmount);
    if (isNaN(amount)) {
      console.error("Invalid bill amount");
      return;
    }
    try {
      await backend.setBillAmount(amount);
      setBillAmount(amount);
    } catch (error) {
      console.error("Error setting bill amount:", error);
    }
  };

  const addPerson = async () => {
    try {
      const id = await backend.addPerson('');
      setPeople([...people, { id, name: '', percentage: 0 }]);
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };

  const updatePersonName = async (id: bigint, name: string) => {
    const updatedPeople = people.map(p => p.id === id ? { ...p, name } : p);
    setPeople(updatedPeople);
  };

  const updatePersonPercentage = async (id: bigint, percentage: number) => {
    const parsedPercentage = parseFloat(percentage.toString());
    if (isNaN(parsedPercentage)) {
      console.error("Invalid percentage");
      return;
    }
    try {
      await backend.updatePercentage(id, parsedPercentage);
      const updatedPeople = people.map(p => p.id === id ? { ...p, percentage: parsedPercentage } : p);
      setPeople(updatedPeople);
      setTotalPercentage(updatedPeople.reduce((sum, p) => sum + p.percentage, 0));
    } catch (error) {
      console.error("Error updating percentage:", error);
    }
  };

  const removePerson = async (id: bigint) => {
    try {
      await backend.removePerson(id);
      setPeople(people.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error removing person:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Bill Splitting App
      </Typography>
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
            <Button onClick={() => removePerson(person.id)} color="secondary">
              Remove
            </Button>
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
    </Container>
  );
}

export default App;
